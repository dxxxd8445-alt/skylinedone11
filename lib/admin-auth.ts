"use server";

import { cookies, headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { 
  getClientIP, 
  isIPLockedOut, 
  recordFailedLogin, 
  clearLoginAttempts,
  logSecurityEvent,
  secureCompare,
  sanitizeInput,
  isSuspiciousRequest,
  generateSecureToken
} from "@/lib/security";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mG7vK2QpN9xR5tH3yL8sD4wZ";
const ADMIN_SESSION_NAME = "magma_admin_session";
const STAFF_SESSION_NAME = "staff-session";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

function generateSessionToken(): string {
  return generateSecureToken();
}

export type AuthContext =
  | { type: "admin" }
  | { type: "staff"; id: string; permissions: string[] }
  | null;

export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get(ADMIN_SESSION_NAME);
  if (adminSession?.value) return { type: "admin" };

  const staffId = cookieStore.get(STAFF_SESSION_NAME)?.value;
  if (!staffId) return null;

  const supabase = createAdminClient();
  const { data: member, error } = await supabase
    .from("team_members")
    .select("id, permissions")
    .eq("id", staffId)
    .eq("status", "active")
    .single();

  if (error || !member) return null;
  
  // Parse permissions from JSONB array
  let permissions: string[] = [];
  try {
    if (member.permissions && Array.isArray(member.permissions)) {
      permissions = member.permissions;
    } else if (typeof member.permissions === 'string') {
      permissions = JSON.parse(member.permissions);
    }
  } catch (e) {
    console.warn("Failed to parse staff permissions:", e);
    permissions = [];
  }
  
  return { type: "staff", id: member.id, permissions };
}

export async function checkAdminSession(): Promise<boolean> {
  const ctx = await getAuthContext();
  return ctx !== null;
}

/** Use in server actions. Throws if caller lacks permission. Admin always allowed. */
export async function requirePermission(permission: string): Promise<void> {
  const ctx = await getAuthContext();
  if (!ctx) throw new Error("Unauthorized");
  if (ctx.type === "admin") return;
  if (ctx.type === "staff" && ctx.permissions.includes(permission)) return;
  throw new Error("Forbidden: insufficient permissions");
}

/** Owner-only. Throws if not admin (staff cannot access). */
export async function requireAdmin(): Promise<void> {
  const ctx = await getAuthContext();
  if (!ctx) throw new Error("Unauthorized");
  if (ctx.type !== "admin") throw new Error("Forbidden: owner only");
}

export async function verifyAdminPassword(
  password: string
): Promise<{ success: boolean; error?: string; lockedUntil?: number }> {
  try {
    // Get request context
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "unknown";
    
    // Create a mock request object for IP extraction
    const mockRequest = new Request("http://localhost", {
      headers: headersList as any
    });
    const ip = getClientIP(mockRequest);
    
    // Sanitize input
    const sanitizedPassword = sanitizeInput(password);
    
    // Check for suspicious requests
    const suspiciousCheck = isSuspiciousRequest(mockRequest);
    if (suspiciousCheck.suspicious) {
      await logSecurityEvent({
        event_type: "suspicious_activity",
        ip_address: ip,
        user_agent: userAgent,
        details: `Suspicious login attempt: ${suspiciousCheck.reason}`,
        severity: "high",
      });
    }
    
    // Check if IP is locked out
    const lockoutCheck = isIPLockedOut(ip);
    if (lockoutCheck.locked) {
      await logSecurityEvent({
        event_type: "lockout",
        ip_address: ip,
        user_agent: userAgent,
        details: `Login attempt while locked out. ${lockoutCheck.remainingTime} minutes remaining`,
        severity: "high",
      });
      
      return { 
        success: false, 
        error: `Too many failed attempts. Try again in ${lockoutCheck.remainingTime} minutes.`,
        lockedUntil: lockoutCheck.remainingTime 
      };
    }
    
    // Log login attempt
    await logSecurityEvent({
      event_type: "login_attempt",
      ip_address: ip,
      user_agent: userAgent,
      details: "Admin login attempt",
      severity: "low",
    });
    
    // Verify password using timing-safe comparison
    const isValid = await secureCompare(sanitizedPassword, ADMIN_PASSWORD);
    
    if (!isValid) {
      // Record failed attempt
      const failResult = recordFailedLogin(ip);
      
      await logSecurityEvent({
        event_type: "login_failed",
        ip_address: ip,
        user_agent: userAgent,
        details: `Failed login attempt. ${failResult.attemptsLeft} attempts remaining`,
        severity: failResult.attemptsLeft <= 1 ? "high" : "medium",
      });
      
      if (failResult.shouldLock) {
        return { 
          success: false, 
          error: "Too many failed attempts. Account locked for 30 minutes." 
        };
      }
      
      return { 
        success: false, 
        error: `Invalid password. ${failResult.attemptsLeft} attempts remaining.` 
      };
    }
    
    // Clear failed attempts on success
    clearLoginAttempts(ip);
    
    // Log successful login
    await logSecurityEvent({
      event_type: "login_success",
      ip_address: ip,
      user_agent: userAgent,
      details: "Admin login successful",
      severity: "low",
    });
    
    // Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.delete(STAFF_SESSION_NAME);
    cookieStore.set(ADMIN_SESSION_NAME, generateSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION / 1000,
      path: "/",
    });
    
    return { success: true };
  } catch (error) {
    console.error("[Admin Auth] Error:", error);
    return { success: false, error: "Authentication error. Please try again." };
  }
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_NAME);
  cookieStore.delete(STAFF_SESSION_NAME);
}

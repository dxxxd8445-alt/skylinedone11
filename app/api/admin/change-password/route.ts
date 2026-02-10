import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getClientIP, 
  checkPasswordChangeRateLimit,
  logSecurityEvent,
  secureCompare,
  sanitizeInput,
  validatePasswordStrength
} from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();
    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "unknown";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateLimit = checkPasswordChangeRateLimit(ip);
    if (!rateLimit.allowed) {
      await logSecurityEvent({
        event_type: "suspicious_activity",
        ip_address: ip,
        user_agent: userAgent,
        details: "Password change rate limit exceeded",
        severity: "high",
      });
      
      return NextResponse.json(
        { success: false, error: "Too many password change attempts. Try again in 1 hour." },
        { status: 429 }
      );
    }

    // Verify admin session exists
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("magma_admin_session");
    
    if (!adminSession) {
      await logSecurityEvent({
        event_type: "suspicious_activity",
        ip_address: ip,
        user_agent: userAgent,
        details: "Password change attempt without valid session",
        severity: "critical",
      });
      
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    // Get current admin password from environment
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { success: false, error: "Admin password not configured" },
        { status: 500 }
      );
    }

    // Sanitize inputs
    const sanitizedCurrent = sanitizeInput(currentPassword);
    const sanitizedNew = sanitizeInput(newPassword);

    // Verify current password using timing-safe comparison
    const isValid = await secureCompare(sanitizedCurrent, adminPassword);
    
    if (!isValid) {
      await logSecurityEvent({
        event_type: "suspicious_activity",
        ip_address: ip,
        user_agent: userAgent,
        details: "Failed password change attempt - incorrect current password",
        severity: "high",
      });
      
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Validate new password strength
    const strengthCheck = validatePasswordStrength(sanitizedNew);
    if (!strengthCheck.valid) {
      return NextResponse.json(
        { success: false, error: strengthCheck.errors.join(". ") },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    const isSame = await secureCompare(sanitizedNew, adminPassword);
    if (isSame) {
      return NextResponse.json(
        { success: false, error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Log successful password change
    await logSecurityEvent({
      event_type: "password_change",
      ip_address: ip,
      user_agent: userAgent,
      details: "Admin password change verified - awaiting environment variable update",
      severity: "medium",
    });

    // Return instructions to update environment variable
    return NextResponse.json({
      success: true,
      message: "Password verified",
      instructions: `To complete the password change, update your ADMIN_PASSWORD environment variable in Vercel to: ${sanitizedNew}`,
      newPassword: sanitizedNew,
    });

  } catch (error) {
    console.error("[Change Password] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
}

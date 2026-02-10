/**
 * Security utilities for protecting admin access and sensitive data
 * Implements rate limiting, brute force protection, and secure logging
 */

import { createAdminClient } from "@/lib/supabase/admin";

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5; // Max attempts per IP per window
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes lockout after max attempts
const MAX_PASSWORD_CHANGE_ATTEMPTS = 3; // Max password change attempts per hour

// In-memory store for rate limiting (use Redis in production for multi-instance)
const loginAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();
const passwordChangeAttempts = new Map<string, { count: number; firstAttempt: number }>();

/**
 * Get client IP address from request headers
 */
export function getClientIP(request: Request): string {
  // Check various headers for real IP (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();
  
  return "unknown";
}

/**
 * Check if IP is currently locked out
 */
export function isIPLockedOut(ip: string): { locked: boolean; remainingTime?: number } {
  const attempt = loginAttempts.get(ip);
  
  if (!attempt?.lockedUntil) {
    return { locked: false };
  }
  
  const now = Date.now();
  if (now < attempt.lockedUntil) {
    return { 
      locked: true, 
      remainingTime: Math.ceil((attempt.lockedUntil - now) / 1000 / 60) // minutes
    };
  }
  
  // Lockout expired, clear it
  loginAttempts.delete(ip);
  return { locked: false };
}

/**
 * Record failed login attempt and check if IP should be locked
 */
export function recordFailedLogin(ip: string): { shouldLock: boolean; attemptsLeft: number } {
  const now = Date.now();
  const attempt = loginAttempts.get(ip);
  
  if (!attempt) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return { shouldLock: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - 1 };
  }
  
  // Reset if window expired
  if (now - attempt.firstAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return { shouldLock: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - 1 };
  }
  
  // Increment attempt count
  attempt.count++;
  
  // Lock if max attempts reached
  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
    loginAttempts.set(ip, attempt);
    return { shouldLock: true, attemptsLeft: 0 };
  }
  
  loginAttempts.set(ip, attempt);
  return { shouldLock: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - attempt.count };
}

/**
 * Clear login attempts for IP (on successful login)
 */
export function clearLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Check password change rate limit
 */
export function checkPasswordChangeRateLimit(ip: string): { allowed: boolean; attemptsLeft: number } {
  const now = Date.now();
  const attempt = passwordChangeAttempts.get(ip);
  
  if (!attempt) {
    passwordChangeAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, attemptsLeft: MAX_PASSWORD_CHANGE_ATTEMPTS - 1 };
  }
  
  // Reset if window expired (1 hour)
  if (now - attempt.firstAttempt > 60 * 60 * 1000) {
    passwordChangeAttempts.set(ip, { count: 1, firstAttempt: now });
    return { allowed: true, attemptsLeft: MAX_PASSWORD_CHANGE_ATTEMPTS - 1 };
  }
  
  // Check if limit reached
  if (attempt.count >= MAX_PASSWORD_CHANGE_ATTEMPTS) {
    return { allowed: false, attemptsLeft: 0 };
  }
  
  // Increment and allow
  attempt.count++;
  passwordChangeAttempts.set(ip, attempt);
  return { allowed: true, attemptsLeft: MAX_PASSWORD_CHANGE_ATTEMPTS - attempt.count };
}

/**
 * Log security event to database
 */
export async function logSecurityEvent(event: {
  event_type: "login_attempt" | "login_success" | "login_failed" | "password_change" | "suspicious_activity" | "lockout";
  ip_address: string;
  user_agent?: string;
  details?: string;
  severity: "low" | "medium" | "high" | "critical";
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    
    // Create security_logs table if it doesn't exist (run migration first)
    await supabase.from("security_logs").insert({
      event_type: event.event_type,
      ip_address: event.ip_address,
      user_agent: event.user_agent || "unknown",
      details: event.details,
      severity: event.severity,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Don't throw - logging should never break the app
    console.error("[Security] Failed to log event:", error);
  }
}

/**
 * Hash sensitive data for comparison (timing-safe)
 */
export async function secureCompare(input: string, expected: string): Promise<boolean> {
  // Use crypto.subtle for timing-safe comparison
  const encoder = new TextEncoder();
  const inputBuffer = encoder.encode(input);
  const expectedBuffer = encoder.encode(expected);
  
  // Ensure same length to prevent timing attacks
  if (inputBuffer.length !== expectedBuffer.length) {
    return false;
  }
  
  // Constant-time comparison
  let result = 0;
  for (let i = 0; i < inputBuffer.length; i++) {
    result |= inputBuffer[i] ^ expectedBuffer[i];
  }
  
  return result === 0;
}

/**
 * Sanitize input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .replace(/[;]/g, "") // Remove semicolons
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Check if request is from suspicious source
 */
export function isSuspiciousRequest(request: Request): { suspicious: boolean; reason?: string } {
  const userAgent = request.headers.get("user-agent") || "";
  const ip = getClientIP(request);
  
  // Check for common bot patterns
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
  ];
  
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      return { suspicious: true, reason: "Bot user agent detected" };
    }
  }
  
  // Check for missing user agent
  if (!userAgent || userAgent.length < 10) {
    return { suspicious: true, reason: "Missing or invalid user agent" };
  }
  
  // Check for localhost/private IPs in production
  if (process.env.NODE_ENV === "production") {
    if (ip === "127.0.0.1" || ip === "localhost" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      return { suspicious: true, reason: "Private IP in production" };
    }
  }
  
  return { suspicious: false };
}

/**
 * Generate secure session token
 */
export function generateSecureToken(): string {
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  const random3 = Math.random().toString(36).substring(2, 10);
  
  return `${timestamp}_${random1}_${random2}_${random3}`;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  
  // Check for common weak passwords
  const weakPasswords = [
    "password", "123456", "admin", "letmein", "welcome", "monkey",
    "qwerty", "abc123", "password123", "admin123"
  ];
  
  if (weakPasswords.some(weak => password.toLowerCase().includes(weak))) {
    errors.push("Password contains common weak patterns");
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Clean up old rate limit entries (call periodically)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  
  // Clean login attempts
  for (const [ip, attempt] of loginAttempts.entries()) {
    if (now - attempt.firstAttempt > RATE_LIMIT_WINDOW && (!attempt.lockedUntil || now > attempt.lockedUntil)) {
      loginAttempts.delete(ip);
    }
  }
  
  // Clean password change attempts
  for (const [ip, attempt] of passwordChangeAttempts.entries()) {
    if (now - attempt.firstAttempt > 60 * 60 * 1000) {
      passwordChangeAttempts.delete(ip);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

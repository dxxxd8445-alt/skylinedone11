import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "mG7vK2QpN9xR5tH3yL8sD4wZ";

function getRequestIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

async function logAuditEvent(
  eventType: "login" | "logout",
  actorRole: "admin" | "staff",
  actorIdentifier: string,
  ipAddress: string | null,
  userAgent: string | null
) {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabase = createAdminClient();
    await supabase.from("admin_audit_logs").insert({
      event_type: eventType,
      actor_role: actorRole,
      actor_identifier: actorIdentifier,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.delete("staff-session");
    
    const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    cookieStore.set("magma_admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    // Log the successful admin login
    const ipAddress = getRequestIp(request);
    const userAgent = request.headers.get("user-agent");
    await logAuditEvent("login", "admin", "admin", ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      user: {
        role: "admin",
        type: "admin",
      },
    });
  } catch (error: any) {
    console.error("[Admin Login] Error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}
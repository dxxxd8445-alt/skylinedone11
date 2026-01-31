import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find team member by email
    const { data: teamMember, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("email", email)
      .eq("status", "active")
      .single();

    if (error || !teamMember) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check password (in production, use proper password hashing)
    if (teamMember.password_hash !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.delete("magma_admin_session");
    cookieStore.set("staff-session", teamMember.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Log the successful login
    const ipAddress = getRequestIp(request);
    const userAgent = request.headers.get("user-agent");
    await logAuditEvent("login", "staff", teamMember.email, ipAddress, userAgent);

    return NextResponse.json({
      success: true,
      user: {
        id: teamMember.id,
        email: teamMember.email,
        name: teamMember.name,
        role: teamMember.role,
      },
    });
  } catch (error: any) {
    console.error("[Staff Login] Error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}

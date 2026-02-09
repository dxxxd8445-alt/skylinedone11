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
    const cookieStore = await cookies();
    
    // Get the current user info from cookies or session
    const adminSession = cookieStore.get("magma_admin_session");
    const staffSession = cookieStore.get("staff-session");
    
    let actorRole: "admin" | "staff" = "admin";
    let actorIdentifier = "admin";
    
    if (staffSession) {
      actorRole = "staff";
      // Get staff member email from database
      try {
        const supabase = createAdminClient();
        const { data: teamMember } = await supabase
          .from("team_members")
          .select("email")
          .eq("id", staffSession.value)
          .single();
        
        if (teamMember) {
          actorIdentifier = teamMember.email;
        } else {
          actorIdentifier = staffSession.value;
        }
      } catch (err) {
        console.error("Failed to get staff email for logout:", err);
        actorIdentifier = staffSession.value;
      }
    }

    // Log the logout event
    const ipAddress = getRequestIp(request);
    const userAgent = request.headers.get("user-agent");
    await logAuditEvent("logout", actorRole, actorIdentifier, ipAddress, userAgent);

    console.log(`✅ ${actorRole} logout: ${actorIdentifier} - Audit log created`);

    // Clear all session cookies
    cookieStore.delete("magma_admin_session");
    cookieStore.delete("staff-session");
    cookieStore.delete("admin-session");

    return NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error: any) {
    console.error("[Logout] Error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}

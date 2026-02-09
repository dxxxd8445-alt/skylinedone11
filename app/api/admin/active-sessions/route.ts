import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/admin-auth";

// Get active sessions (logins without matching logouts in last 24 hours)
export async function GET() {
  try {
    await requirePermission("manage_logins");

    const supabase = createAdminClient();
    
    // Get all logins from the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    console.log(`[Active Sessions] Checking for logins after: ${twentyFourHoursAgo}`);
    
    const { data: recentLogins, error: loginsError } = await supabase
      .from("admin_audit_logs")
      .select("*")
      .eq("event_type", "login")
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false });

    if (loginsError) {
      console.error("Error fetching logins:", loginsError);
      // If table doesn't exist, return empty sessions
      return NextResponse.json({
        success: true,
        sessions: [],
        count: 0,
        message: "Audit logs table not found. Please run database setup script.",
      });
    }

    console.log(`[Active Sessions] Found ${recentLogins?.length || 0} logins in last 24h`);

    // Get all logouts from the last 24 hours
    const { data: recentLogouts, error: logoutsError } = await supabase
      .from("admin_audit_logs")
      .select("*")
      .eq("event_type", "logout")
      .gte("created_at", twentyFourHoursAgo)
      .order("created_at", { ascending: false });

    if (logoutsError) {
      console.error("Error fetching logouts:", logoutsError);
    }

    console.log(`[Active Sessions] Found ${recentLogouts?.length || 0} logouts in last 24h`);

    // Find active sessions (logins without matching logouts)
    const activeSessions = [];
    const logoutMap = new Map();

    // Create a map of the MOST RECENT logout for each user
    recentLogouts?.forEach(logout => {
      const key = `${logout.actor_role}-${logout.actor_identifier}`;
      const existing = logoutMap.get(key);
      if (!existing || new Date(logout.created_at) > new Date(existing.created_at)) {
        logoutMap.set(key, logout);
      }
    });

    console.log(`[Active Sessions] Logout map has ${logoutMap.size} entries`);

    // Check each login to see if there's a matching logout after it
    recentLogins?.forEach(login => {
      const key = `${login.actor_role}-${login.actor_identifier}`;
      const logout = logoutMap.get(key);
      
      const loginTime = new Date(login.created_at).getTime();
      const logoutTime = logout ? new Date(logout.created_at).getTime() : 0;
      
      console.log(`[Active Sessions] Checking ${key}:`);
      console.log(`  - Login: ${login.created_at} (${loginTime})`);
      console.log(`  - Logout: ${logout?.created_at || 'none'} (${logoutTime})`);
      console.log(`  - Is Active: ${!logout || logoutTime < loginTime}`);
      
      // If no logout or logout happened before this login, session is active
      if (!logout || logoutTime < loginTime) {
        console.log(`✅ Active session found: ${key}`);
        activeSessions.push({
          id: login.id,
          actor_role: login.actor_role,
          actor_identifier: login.actor_identifier,
          ip_address: login.ip_address,
          user_agent: login.user_agent,
          login_time: login.created_at,
          session_duration: Math.floor((Date.now() - loginTime) / 1000 / 60), // minutes
        });
      } else {
        console.log(`❌ Session already logged out: ${key}`);
      }
    });

    // Remove duplicates (keep most recent login for each user)
    const uniqueSessions = new Map();
    activeSessions.forEach(session => {
      const key = `${session.actor_role}-${session.actor_identifier}`;
      if (!uniqueSessions.has(key) || new Date(session.login_time) > new Date(uniqueSessions.get(key).login_time)) {
        uniqueSessions.set(key, session);
      }
    });

    console.log(`Found ${uniqueSessions.size} active sessions`);

    return NextResponse.json({
      success: true,
      sessions: Array.from(uniqueSessions.values()),
      count: uniqueSessions.size,
    });
  } catch (error: any) {
    console.error("Active sessions error:", error);
    const msg = error?.message ?? "Failed to fetch active sessions";
    const status = /Unauthorized|Forbidden/i.test(msg) ? 401 : 500;
    return NextResponse.json({ success: false, error: msg, sessions: [], count: 0 }, { status });
  }
}

// Force logout a specific session
export async function DELETE(request: NextRequest) {
  try {
    await requirePermission("manage_logins");

    const { actor_role, actor_identifier } = await request.json();

    if (!actor_role || !actor_identifier) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Log a forced logout event
    const { error } = await supabase.from("admin_audit_logs").insert({
      event_type: "logout",
      actor_role: actor_role,
      actor_identifier: actor_identifier,
      ip_address: request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || null,
      user_agent: request.headers.get("user-agent"),
    });

    if (error) throw error;

    // In a real system, you would also invalidate the session token here
    // For now, we just log the logout event

    return NextResponse.json({
      success: true,
      message: `Forced logout for ${actor_identifier}`,
    });
  } catch (error: any) {
    console.error("Force logout error:", error);
    const msg = error?.message ?? "Failed to force logout";
    const status = /Unauthorized|Forbidden/i.test(msg) ? 401 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

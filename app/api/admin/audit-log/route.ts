import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission, getAuthContext } from "@/lib/admin-auth";

function getRequestIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return null;
}

type AuditEvent = {
  event_type: "login" | "logout";
  actor_role: "admin" | "staff";
  actor_identifier: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at?: string;
};

export async function GET() {
  try {
    // Check if user has permission to view logs (admin or staff with manage_logins permission)
    const authContext = await getAuthContext();
    if (!authContext) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Admin can always access, staff needs manage_logins permission
    if (authContext.type === "staff") {
      await requirePermission("manage_logins");
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("admin_audit_logs")
      .select("id, event_type, actor_role, actor_identifier, ip_address, user_agent, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;
    return NextResponse.json({ success: true, logs: data ?? [] });
  } catch (error: any) {
    console.error("Audit log GET error:", error);
    const msg = error?.message ?? "Failed to fetch logs";
    const status = /Unauthorized|Forbidden/i.test(msg) ? 401 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if user has permission to write logs (admin or staff with manage_logins permission)
    const authContext = await getAuthContext();
    if (!authContext) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Admin can always access, staff needs manage_logins permission
    if (authContext.type === "staff") {
      await requirePermission("manage_logins");
    }

    const body = (await req.json()) as Partial<AuditEvent>;
    if (!body.event_type || !body.actor_role || !body.actor_identifier) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const ip_address = body.ip_address ?? getRequestIp(req);
    const user_agent = body.user_agent ?? req.headers.get("user-agent");

    const { error } = await supabase.from("admin_audit_logs").insert({
      event_type: body.event_type,
      actor_role: body.actor_role,
      actor_identifier: body.actor_identifier,
      ip_address,
      user_agent,
    });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Audit log POST error:", error);
    const msg = error?.message ?? "Failed to write log";
    const status = /Unauthorized|Forbidden/i.test(msg) ? 401 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

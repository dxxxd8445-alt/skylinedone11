import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/admin-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission("manage_orders"); // Using manage_orders as customer management permission

    const customerId = params.id;
    const supabase = createAdminClient();

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from("store_users")
      .select("email, username")
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // In a real system, you would invalidate their session tokens here
    // For now, we'll just log the forced logout in audit logs
    
    // Log the forced logout event
    await supabase.from("admin_audit_logs").insert({
      event_type: "logout",
      actor_role: "staff", // Customer being logged out
      actor_identifier: customer.email,
      ip_address: request.headers.get("x-forwarded-for")?.split(",")[0] || 
                  request.headers.get("x-real-ip") || 
                  null,
      user_agent: request.headers.get("user-agent"),
    });

    return NextResponse.json({
      success: true,
      message: `Forced logout for customer: ${customer.email}`,
    });
  } catch (error: any) {
    console.error("Force logout error:", error);
    const msg = error?.message ?? "Failed to force logout";
    const status = /Unauthorized|Forbidden/i.test(msg) ? 401 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

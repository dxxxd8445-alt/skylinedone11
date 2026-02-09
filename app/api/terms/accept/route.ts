import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const supabase = createClient();

    // Try to insert terms acceptance record
    // If table doesn't exist, just return success (fail gracefully)
    const { error } = await supabase
      .from("terms_acceptances")
      .insert({
        user_id,
        accepted_at: new Date().toISOString(),
        ip_address: request.headers.get("x-forwarded-for")?.split(",")[0] || 
                    request.headers.get("x-real-ip") || 
                    null,
        user_agent: request.headers.get("user-agent"),
      });

    if (error) {
      // Table doesn't exist or other error - fail gracefully
      console.log("Terms acceptance not recorded (table may not exist):", error.message);
      // Still return success so user can proceed
      return NextResponse.json({ success: true, recorded: false });
    }

    return NextResponse.json({ success: true, recorded: true });
  } catch (error: any) {
    console.error("Terms acceptance error:", error);
    // Fail gracefully - allow user to proceed
    return NextResponse.json({ success: true, recorded: false });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    console.log("[Storrik API Key] Fetching from database...");
    
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "storrik_api_key")
      .single();

    if (error) {
      console.error("[Storrik API Key] Database error:", error);
      return NextResponse.json({ apiKey: null });
    }

    if (!data) {
      console.log("[Storrik API Key] No setting found");
      return NextResponse.json({ apiKey: null });
    }

    // Parse the JSON value
    let apiKey = null;
    try {
      apiKey = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      console.log("[Storrik API Key] Found:", apiKey ? "Yes" : "No");
    } catch (e) {
      console.error("[Storrik API Key] Parse error:", e);
      apiKey = data.value;
    }

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("[Storrik API Key] Error:", error);
    return NextResponse.json({ apiKey: null });
  }
}

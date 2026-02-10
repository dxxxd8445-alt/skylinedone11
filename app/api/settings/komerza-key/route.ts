import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    console.log("[Komerza API Key] Fetching from database...");
    
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "komerza_api_key")
      .single();

    if (error) {
      console.error("[Komerza API Key] Database error:", error);
      return NextResponse.json({ apiKey: null });
    }

    if (!data) {
      console.log("[Komerza API Key] No setting found");
      return NextResponse.json({ apiKey: null });
    }

    // Parse JSON value
    let apiKey = null;
    try {
      apiKey = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
      console.log("[Komerza API Key] Found:", apiKey ? "Yes" : "No");
    } catch (e) {
      console.error("[Komerza API Key] Parse error:", e);
      apiKey = data.value;
    }

    return NextResponse.json({ apiKey });
  } catch (error) {
    console.error("[Komerza API Key] Error:", error);
    return NextResponse.json({ apiKey: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "API key is required" 
      }, { status: 400 });
    }
    
    // Validate format (Komerza API keys typically start with specific patterns)
    if (!apiKey.startsWith('kz_') && !apiKey.startsWith('pk_')) {
      return NextResponse.json({ 
        error: "Invalid API key format" 
      }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Update or insert setting
    const { data, error } = await supabase
      .from("settings")
      .upsert({
        key: "komerza_api_key",
        value: JSON.stringify(apiKey),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("[Komerza API Key] Update error:", error);
      return NextResponse.json({ 
        error: "Failed to update API key" 
      }, { status: 500 });
    }

    console.log("[Komerza API Key] Updated successfully");
    return NextResponse.json({ 
      success: true,
      message: "Komerza API key updated successfully" 
    });
  } catch (error) {
    console.error("[Komerza API Key] POST Error:", error);
    return NextResponse.json({ 
      error: "Failed to process request" 
    }, { status: 500 });
  }
}

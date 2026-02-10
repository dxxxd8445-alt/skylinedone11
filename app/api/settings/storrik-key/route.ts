import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // First try environment variable
    const envKey = process.env.STORRIK_PUBLIC_KEY;
    if (envKey) {
      console.log("[Storrik API Key] Using environment variable");
      return NextResponse.json({ apiKey: envKey });
    }

    // Fallback to database
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

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "API key is required" 
      }, { status: 400 });
    }
    
    // Validate the format
    if (!apiKey.startsWith('pk_')) {
      return NextResponse.json({ 
        error: "Invalid API key format. Should start with 'pk_'" 
      }, { status: 400 });
    }
    
    const supabase = await createClient();
    
    // Update or insert the setting
    const { data, error } = await supabase
      .from("settings")
      .upsert({
        key: "storrik_api_key",
        value: JSON.stringify(apiKey),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("[Storrik API Key] Update error:", error);
      return NextResponse.json({ 
        error: "Failed to update API key" 
      }, { status: 500 });
    }

    console.log("[Storrik API Key] Updated successfully");
    return NextResponse.json({ 
      success: true,
      message: "Storrik API key updated successfully" 
    });
  } catch (error) {
    console.error("[Storrik API Key] POST Error:", error);
    return NextResponse.json({ 
      error: "Failed to process request" 
    }, { status: 500 });
  }
}

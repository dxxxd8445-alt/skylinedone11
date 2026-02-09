import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const supabase = createClient();
    
    const now = new Date().toISOString();
    
    // Try to fetch with expires_at, but handle if column doesn't exist
    const { data: announcements, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      // If table doesn't exist or has issues, return empty array
      console.error("Error fetching announcements:", error);
      return NextResponse.json({ announcements: [] });
    }

    // Filter out expired announcements if expires_at exists
    const activeAnnouncements = (announcements || []).filter(announcement => {
      if (!announcement.expires_at) return true; // No expiration
      return new Date(announcement.expires_at) > new Date(); // Not expired
    });

    return NextResponse.json({ announcements: activeAnnouncements });
  } catch (error: any) {
    console.error("Announcements API error:", error);
    return NextResponse.json({ announcements: [] });
  }
}

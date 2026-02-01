"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/admin-auth";

export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export async function loadAnnouncements() {
  try {
    // Check if user has admin or settings permission
    const ctx = await getAuthContext();
    if (!ctx) {
      return { success: false, error: "You must be logged in to access this page." };
    }
    
    // Allow both admin and staff with manage_settings permission
    if (ctx.type === "staff" && !ctx.permissions.includes("manage_settings")) {
      return { success: false, error: "You don't have permission to manage announcements." };
    }
    
    const supabase = createAdminClient();
    
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Admin] Load announcements error:", error);
      return { success: false, error: `Database error: ${error.message}` };
    }

    return { success: true, announcements: data || [] };
  } catch (error: any) {
    console.error("[Admin] Load announcements error:", error);
    return { success: false, error: error.message || "Failed to load announcements" };
  }
}

export async function createAnnouncement(data: {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: number;
}) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return { success: false, error: "You must be logged in to access this page." };
    }
    
    if (ctx.type === "staff" && !ctx.permissions.includes("manage_settings")) {
      return { success: false, error: "You don't have permission to create announcements." };
    }
    
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("announcements")
      .insert({
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type,
        priority: data.priority,
        is_active: true,
      });

    if (error) {
      console.error("[Admin] Create announcement error:", error);
      return { success: false, error: `Database error: ${error.message}` };
    }

    revalidatePath("/mgmt-x9k2m7/announcements");
    revalidatePath("/"); // Revalidate homepage to show new announcement
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Create announcement error:", error);
    return { success: false, error: error.message || "Failed to create announcement" };
  }
}

export async function updateAnnouncement(id: string, data: {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: number;
}) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return { success: false, error: "You must be logged in to access this page." };
    }
    
    if (ctx.type === "staff" && !ctx.permissions.includes("manage_settings")) {
      return { success: false, error: "You don't have permission to update announcements." };
    }
    
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("announcements")
      .update({
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type,
        priority: data.priority,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("[Admin] Update announcement error:", error);
      return { success: false, error: `Database error: ${error.message}` };
    }

    revalidatePath("/mgmt-x9k2m7/announcements");
    revalidatePath("/"); // Revalidate homepage to show updated announcement
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Update announcement error:", error);
    return { success: false, error: error.message || "Failed to update announcement" };
  }
}

export async function toggleAnnouncementStatus(id: string, currentStatus: boolean) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return { success: false, error: "You must be logged in to access this page." };
    }
    
    if (ctx.type === "staff" && !ctx.permissions.includes("manage_settings")) {
      return { success: false, error: "You don't have permission to toggle announcements." };
    }
    
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("announcements")
      .update({
        is_active: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("[Admin] Toggle announcement status error:", error);
      return { success: false, error: `Database error: ${error.message}` };
    }

    revalidatePath("/mgmt-x9k2m7/announcements");
    revalidatePath("/"); // Revalidate homepage to show/hide announcement
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Toggle announcement status error:", error);
    return { success: false, error: error.message || "Failed to toggle announcement status" };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    const ctx = await getAuthContext();
    if (!ctx) {
      return { success: false, error: "You must be logged in to access this page." };
    }
    
    if (ctx.type === "staff" && !ctx.permissions.includes("manage_settings")) {
      return { success: false, error: "You don't have permission to delete announcements." };
    }
    
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[Admin] Delete announcement error:", error);
      return { success: false, error: `Database error: ${error.message}` };
    }

    revalidatePath("/mgmt-x9k2m7/announcements");
    revalidatePath("/"); // Revalidate homepage to remove announcement
    return { success: true };
  } catch (error: any) {
    console.error("[Admin] Delete announcement error:", error);
    return { success: false, error: error.message || "Failed to delete announcement" };
  }
}
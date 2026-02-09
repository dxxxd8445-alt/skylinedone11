"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";

export async function loadSettings() {
  try {
    await requirePermission("manage_settings");
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("settings")
      .select("key, value");

    if (error) throw error;

    const settingsMap: Record<string, any> = {};
    data?.forEach((item) => {
      try {
        // Try to parse as JSON first
        settingsMap[item.key] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
      } catch (e) {
        // If parsing fails, use the raw value (it's already a plain string)
        settingsMap[item.key] = item.value;
      }
    });

    return { 
      success: true, 
      settings: {
        site_name: settingsMap.site_name || "Skyline Cheats",
        site_description: settingsMap.site_description || "Premium undetected cheats for all games",
        support_email: settingsMap.support_email || "support@skyline.local",
        maintenance_mode: settingsMap.maintenance_mode || false,
        storrik_api_key: settingsMap.storrik_api_key || "",
      }
    };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Load settings error:", error);
    return { success: false, error: error.message };
  }
}

export async function saveSettings(settings: {
  site_name: string;
  site_description: string;
  support_email: string;
  maintenance_mode: boolean;
  storrik_api_key: string;
}) {
  try {
    await requirePermission("manage_settings");
    const supabase = createAdminClient();

    const updates = [
      { key: "site_name", value: JSON.stringify(settings.site_name) },
      { key: "site_description", value: JSON.stringify(settings.site_description) },
      { key: "support_email", value: JSON.stringify(settings.support_email) },
      { key: "maintenance_mode", value: JSON.stringify(settings.maintenance_mode) },
      { key: "storrik_api_key", value: JSON.stringify(settings.storrik_api_key) },
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from("settings")
        .upsert(
          { key: update.key, value: update.value, updated_at: new Date().toISOString() },
          { onConflict: "key" }
        );

      if (error) throw error;
    }

    revalidatePath("/mgmt-x9k2m7/settings");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Save settings error:", error);
    return { success: false, error: error.message };
  }
}

"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";

export async function createCoupon(data: {
  code: string;
  discount_percent: number;
  max_uses: number | null;
  valid_until: string | null;
}) {
  try {
    await requirePermission("manage_coupons");
    const supabase = createAdminClient();
    
    // Check if coupon code already exists
    const { data: existingCoupon, error: checkError } = await supabase
      .from("coupons")
      .select("id")
      .eq("code", data.code.toUpperCase())
      .single();
    
    if (existingCoupon) {
      return { success: false, error: `Coupon code "${data.code.toUpperCase()}" already exists. Please choose a different code.` };
    }
    
    // If checkError is not "PGRST116" (no rows found), it's a real error
    if (checkError && checkError.code !== "PGRST116") {
      console.error("[Admin] Check coupon error:", checkError);
      return { success: false, error: "Failed to validate coupon code" };
    }
    
    const { error } = await supabase.from("coupons").insert({
      code: data.code.toUpperCase(),
      discount_type: 'percent',
      discount_value: data.discount_percent,
      max_uses: data.max_uses,
      current_uses: 0,
      is_active: true,
      expires_at: data.valid_until,
    });

    if (error) {
      console.error("[Admin] Create coupon error:", error);
      if (error.code === "23505") { // Unique constraint violation
        return { success: false, error: `Coupon code "${data.code.toUpperCase()}" already exists. Please choose a different code.` };
      }
      throw error;
    }

    revalidatePath("/mgmt-x9k2m7/coupons");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Create coupon error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCoupon(id: string, data: {
  code: string;
  discount_percent: number;
  max_uses: number | null;
  valid_until: string | null;
}) {
  try {
    await requirePermission("manage_coupons");
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("coupons")
      .update({
        code: data.code.toUpperCase(),
        discount_type: 'percent',
        discount_value: data.discount_percent,
        max_uses: data.max_uses,
        expires_at: data.valid_until,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/coupons");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Update coupon error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await requirePermission("manage_coupons");
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/coupons");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Delete coupon error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleCouponStatus(id: string, currentStatus: boolean) {
  try {
    await requirePermission("manage_coupons");
    const supabase = createAdminClient();
    
    const { error } = await supabase
      .from("coupons")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/mgmt-x9k2m7/coupons");
    return { success: true };
  } catch (error: any) {
    if (error?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(error?.message ?? ""))
      return { success: false, error: "You don't have permission to do this." };
    console.error("[Admin] Toggle coupon status error:", error);
    return { success: false, error: error.message };
  }
}

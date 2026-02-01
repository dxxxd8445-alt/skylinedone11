"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/admin-auth";

export type OrderStatus = "pending" | "completed" | "failed" | "refunded" | "paid";

export interface OrderRow {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name?: string;
  product_id: string | null;
  product_name: string;
  duration: string;
  amount: number;
  amount_cents?: number;
  currency?: string;
  status: string;
  payment_method: string;
  payment_intent_id?: string;
  stripe_session_id?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderDetail extends OrderRow {
  license?: {
    id: string;
    license_key: string;
    status: string;
    expires_at: string | null;
    created_at: string;
  } | null;
}

export async function getOrders(statusFilter?: OrderStatus | "all"): Promise<{
  success: boolean;
  error?: string;
  data?: OrderRow[];
}> {
  try {
    await requirePermission("manage_orders");
    const supabase = createAdminClient();
    let q = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (statusFilter && statusFilter !== "all") {
      q = q.eq("status", statusFilter);
    }
    const { data, error } = await q;
    if (error) throw error;
    const rows = (data ?? []).map((o) => ({
      id: o.id,
      order_number: o.order_number || `ORD-${o.id.slice(0, 8)}`,
      customer_email: o.customer_email || 'unknown@example.com',
      customer_name: o.customer_name || 'Unknown Customer',
      product_id: o.product_id,
      product_name: o.product_name || 'Digital Product',
      duration: o.duration || 'N/A',
      amount: o.amount_cents ? Number(o.amount_cents) / 100 : Number(o.amount || 0),
      amount_cents: o.amount_cents,
      currency: o.currency || 'USD',
      status: o.status || 'pending',
      payment_method: o.payment_method || 'unknown',
      payment_intent_id: o.payment_intent_id,
      stripe_session_id: o.stripe_session_id,
      created_at: o.created_at,
      updated_at: o.updated_at,
    })) as OrderRow[];
    return { success: true, data: rows };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? "")) {
      return { success: false, error: "You don't have permission to do this.", data: [] };
    }
    console.error("[Admin Orders] getOrders error:", e);
    return { success: false, error: err?.message ?? "Failed to load orders", data: [] };
  }
}

export async function getOrderDetail(orderId: string): Promise<{
  success: boolean;
  error?: string;
  data?: OrderDetail;
}> {
  try {
    await requirePermission("manage_orders");
    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (error || !order) {
      return { success: false, error: "Order not found" };
    }
    const { data: licenses } = await supabase
      .from("licenses")
      .select("id, license_key, status, expires_at, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1);
    const license = licenses?.[0] ?? null;
    const detail: OrderDetail = {
      id: order.id,
      order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
      customer_email: order.customer_email || 'unknown@example.com',
      customer_name: order.customer_name || 'Unknown Customer',
      product_id: order.product_id,
      product_name: order.product_name || 'Digital Product',
      duration: order.duration || 'N/A',
      amount: order.amount_cents ? Number(order.amount_cents) / 100 : Number(order.amount || 0),
      amount_cents: order.amount_cents,
      currency: order.currency || 'USD',
      status: order.status || 'pending',
      payment_method: order.payment_method || 'unknown',
      payment_intent_id: order.payment_intent_id,
      stripe_session_id: order.stripe_session_id,
      created_at: order.created_at,
      updated_at: order.updated_at,
      license: license ? {
        id: license.id,
        license_key: license.license_key,
        status: license.status,
        expires_at: license.expires_at,
        created_at: license.created_at,
      } : null,
    };
    return { success: true, data: detail };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? "")) {
      return { success: false, error: "You don't have permission to do this." };
    }
    console.error("[Admin Orders] getOrderDetail error:", e);
    return { success: false, error: err?.message ?? "Failed to load order" };
  }
}

function generateLicenseKey(productName: string, duration: string): string {
  const prefix = productName.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "X");
  const durationCode = duration.includes("30") ? "30D" : duration.includes("7") ? "7D" : "1D";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const r = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `MGMA-${prefix}-${durationCode}-${r()}-${r()}`;
}

function expiresAtFromDuration(duration: string): string {
  const now = new Date();
  if (duration.includes("30")) {
    return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
  if (duration.includes("7")) {
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }
  return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requirePermission("manage_orders");
    const supabase = createAdminClient();
    const { data: order, error: fetchErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();
    if (fetchErr || !order) {
      return { success: false, error: "Order not found" };
    }

    const { error: updateErr } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);
    if (updateErr) throw updateErr;

    if (newStatus === "completed") {
      const existing = await supabase
        .from("licenses")
        .select("id")
        .eq("order_id", orderId)
        .maybeSingle();
      if (!existing.data) {
        const licenseKey = generateLicenseKey(order.product_name, order.duration);
        const expiresAt = expiresAtFromDuration(order.duration);
        await supabase.from("licenses").insert({
          license_key: licenseKey,
          order_id: order.id,
          product_id: order.product_id,
          product_name: order.product_name,
          customer_email: order.customer_email,
          status: "active",
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        });
      }

      // Trigger completed order webhook
      const { triggerWebhooks } = await import("@/lib/discord-webhook");
      await triggerWebhooks('order.completed', {
        order_number: order.order_number,
        customer_email: order.customer_email,
        customer_name: order.customer_name || 'Unknown',
        amount: order.amount_cents ? (order.amount_cents / 100) : (order.amount || 0),
        currency: order.currency || 'USD',
        status: 'completed',
        items: [{
          name: `${order.product_name} - ${order.duration}`,
          quantity: 1,
          price: order.amount_cents ? (order.amount_cents / 100) : (order.amount || 0),
        }],
      });
    } else if (newStatus === "refunded") {
      await supabase
        .from("licenses")
        .update({ status: "revoked", updated_at: new Date().toISOString() })
        .eq("order_id", orderId);

      // Trigger refund webhook
      const { triggerWebhooks } = await import("@/lib/discord-webhook");
      await triggerWebhooks('order.refunded', {
        order_number: order.order_number,
        customer_email: order.customer_email,
        customer_name: order.customer_name || 'Unknown',
        amount: order.amount_cents ? (order.amount_cents / 100) : (order.amount || 0),
        currency: order.currency || 'USD',
        reason: 'Manual refund by admin',
      });
    } else if (newStatus === "failed") {
      // Trigger failed payment webhook
      const { triggerWebhooks } = await import("@/lib/discord-webhook");
      await triggerWebhooks('payment.failed', {
        order_number: order.order_number,
        customer_email: order.customer_email,
        customer_name: order.customer_name || 'Unknown',
        amount: order.amount_cents ? (order.amount_cents / 100) : (order.amount || 0),
        currency: order.currency || 'USD',
        error_message: 'Order marked as failed by admin',
      });
    }

    revalidatePath("/mgmt-x9k2m7/orders");
    return { success: true };
  } catch (e: unknown) {
    const err = e as { message?: string };
    if (err?.message === "Unauthorized" || /Forbidden|insufficient permissions/i.test(err?.message ?? "")) {
      return { success: false, error: "You don't have permission to do this." };
    }
    console.error("[Admin Orders] updateOrderStatus error:", e);
    return { success: false, error: err?.message ?? "Failed to update order" };
  }
}

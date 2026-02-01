import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyStoreSession, COOKIE_NAME } from "@/lib/store-session";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ orders: [], licenses: [] });

    const session = verifyStoreSession(token);
    if (!session) return NextResponse.json({ orders: [], licenses: [] });

    const supabase = createAdminClient();
    const [ordersRes, licensesRes] = await Promise.all([
      supabase
        .from("orders")
        .select("id, order_number, customer_name, product_name, duration, amount_cents, currency, status, payment_method, payment_intent_id, created_at")
        .eq("customer_email", session.email)
        .in("status", ["completed", "pending", "processing"]) // Only show relevant statuses to customers
        .order("created_at", { ascending: false }),
      supabase
        .from("licenses")
        .select("id, license_key, product_name, status, expires_at, created_at, order_id")
        .eq("customer_email", session.email)
        .in("status", ["active", "unused", "expired"]) // Only show relevant license statuses
        .order("created_at", { ascending: false }),
    ]);

    const orders = (ordersRes.data ?? []).map((o) => ({ 
      ...o, 
      amount: o.amount_cents ? Number(o.amount_cents) / 100 : 0,
      customer_name: o.customer_name || 'Unknown Customer',
      currency: o.currency || 'USD',
      payment_method: o.payment_method || 'stripe',
    }));
    const licenses = licensesRes.data ?? [];
    return NextResponse.json({ orders, licenses });
  } catch {
    return NextResponse.json({ orders: [], licenses: [] });
  }
}

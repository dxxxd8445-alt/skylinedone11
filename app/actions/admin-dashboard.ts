"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/admin-auth";

export async function getDashboardStats(dateRange: string = "last30days") {
  try {
    await requirePermission("view_dashboard");
    
    const supabase = createAdminClient();
    const range = getDateRange(dateRange);
    
    // Get all completed orders
    let ordersQuery = supabase
      .from("orders")
      .select("amount_cents, status, created_at, customer_email")
      .eq("status", "completed");

    if (range) {
      ordersQuery = ordersQuery
        .gte("created_at", range.start.toISOString())
        .lte("created_at", range.end.toISOString());
    }

    const { data: orders, error: ordersError } = await ordersQuery;
    
    if (ordersError) {
      console.error("Error fetching orders:", ordersError);
      throw ordersError;
    }

    console.log("Orders fetched:", orders?.length, "orders");
    console.log("Sample order:", orders?.[0]);

    // Calculate revenue from amount_cents
    const revenue = orders?.reduce((sum, order) => {
      const amount = order.amount_cents ? order.amount_cents / 100 : 0;
      console.log("Order amount_cents:", order.amount_cents, "-> amount:", amount);
      return sum + amount;
    }, 0) || 0;

    console.log("Total revenue calculated:", revenue);

    const orderCount = orders?.length || 0;

    // Get licenses count
    let licensesQuery = supabase
      .from("licenses")
      .select("*", { count: "exact", head: true });

    if (range) {
      licensesQuery = licensesQuery
        .gte("created_at", range.start.toISOString())
        .lte("created_at", range.end.toISOString());
    }

    const { count: licensesCount } = await licensesQuery;

    // Calculate growth rate
    const prevRange = getPreviousPeriodRange(dateRange);
    let prevRevenue = 0;
    
    if (prevRange) {
      const { data: prevOrders } = await supabase
        .from("orders")
        .select("amount_cents")
        .eq("status", "completed")
        .gte("created_at", prevRange.start.toISOString())
        .lte("created_at", prevRange.end.toISOString());

      prevRevenue = prevOrders?.reduce((sum, order) => {
        const amount = order.amount_cents ? order.amount_cents / 100 : 0;
        return sum + amount;
      }, 0) || 0;
    }

    const growthRate = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Get unique customers
    const uniqueCustomers = new Set(orders?.map(o => o.customer_email) || []).size;

    // Get recent activity
    const { data: recentOrders } = await supabase
      .from("orders")
      .select("id, customer_email, amount_cents, status, created_at, product_name")
      .order("created_at", { ascending: false })
      .limit(5);

    return {
      success: true,
      data: {
        revenue,
        orders: orderCount,
        licenses: licensesCount || 0,
        growthRate: Math.round(growthRate * 10) / 10,
        newCustomers: uniqueCustomers,
        conversionRate: orderCount > 0 ? Math.round((orderCount / (orderCount + 10)) * 100) : 0,
        recentActivity: recentOrders || [],
      }
    };
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return {
      success: false,
      error: error.message || "Failed to load dashboard stats",
      data: {
        revenue: 0,
        orders: 0,
        licenses: 0,
        growthRate: 0,
        newCustomers: 0,
        conversionRate: 0,
        recentActivity: [],
      }
    };
  }
}

function getDateRange(filter: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case "today":
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    case "yesterday":
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    case "last7days":
      return {
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now
      };
    case "last30days":
      return {
        start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now
      };
    case "thisMonth":
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now
      };
    case "lastMonth":
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return {
        start: lastMonth,
        end: lastMonthEnd
      };
    case "thisYear":
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: now
      };
    default:
      return null;
  }
}

function getPreviousPeriodRange(filter: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case "today":
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        start: yesterday,
        end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    case "last7days":
      return {
        start: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      };
    case "last30days":
      return {
        start: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      };
    default:
      return null;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePermission } from "@/lib/admin-auth";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requirePermission("manage_orders"); // Using manage_orders as customer management permission

    const customerId = params.id;
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from("store_users")
      .select("email, username")
      .eq("id", customerId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the password
    const { error: updateError } = await supabase
      .from("store_users")
      .update({ password_hash: hashedPassword })
      .eq("id", customerId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: `Password reset for customer: ${customer.email}`,
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    const msg = error?.message ?? "Failed to reset password";
    const status = /Unauthorized|Forbidden/i.test(msg) ? 401 : 500;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

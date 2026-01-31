import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    const orderNumber = searchParams.get('order_number');

    if (!sessionId && !orderNumber) {
      return NextResponse.json(
        { error: 'Session ID or order number is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Query by session ID or order number
    let query = supabase
      .from('orders')
      .select(`
        *,
        licenses (
          license_key,
          product_name,
          status
        )
      `);

    if (sessionId) {
      query = query.eq('stripe_session_id', sessionId);
    } else {
      query = query.eq('order_number', orderNumber);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      console.error('Order not found:', error);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Format the response
    const response = {
      success: true,
      order: {
        order_number: order.order_number,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        amount: order.amount_cents / 100, // Convert cents to dollars
        currency: order.currency,
        status: order.status,
        payment_method: order.payment_method,
        created_at: order.created_at,
        coupon_code: order.coupon_code,
        coupon_discount_amount: order.coupon_discount_amount,
      },
      licenses: order.licenses?.map((license: any) => ({
        license_key: license.license_key,
        product_name: license.product_name,
        status: license.status,
      })) || [],
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Order status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
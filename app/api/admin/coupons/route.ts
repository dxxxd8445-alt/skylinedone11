import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coupons:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coupons: coupons || [] });
  } catch (error: any) {
    console.error('Coupons API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    // Validate required fields
    if (!body.code || body.discountValue === undefined || body.discountValue === null) {
      return NextResponse.json(
        { error: 'Missing required fields: code and discountValue' },
        { status: 400 }
      );
    }

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({
        code: body.code.toUpperCase(),
        discount_type: body.discountType || 'percentage',
        discount_value: body.discountValue,
        max_uses: body.maxUses || 100,
        current_uses: 0,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating coupon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    console.error('Coupons POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

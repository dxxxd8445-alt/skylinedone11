import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting coupon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Coupon DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

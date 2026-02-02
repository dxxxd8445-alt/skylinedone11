import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id;
    
    if (!customerId || customerId === 'undefined') {
      console.error('[DELETE] Invalid customer ID:', customerId);
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 });
    }

    console.log(`[DELETE] Starting deletion of customer: ${customerId}`);
    const supabase = createAdminClient();

    // Delete all orders for this customer
    console.log(`[DELETE] Deleting orders for customer: ${customerId}`);
    const { error: ordersError } = await supabase
      .from('orders')
      .delete()
      .eq('customer_id', customerId);

    if (ordersError) {
      console.error('[DELETE] Error deleting orders:', ordersError);
      return NextResponse.json({ error: 'Failed to delete orders', details: ordersError.message }, { status: 500 });
    }

    // Delete all licenses for this customer
    console.log(`[DELETE] Deleting licenses for customer: ${customerId}`);
    const { error: licensesError } = await supabase
      .from('licenses')
      .delete()
      .eq('customer_id', customerId);

    if (licensesError) {
      console.error('[DELETE] Error deleting licenses:', licensesError);
      return NextResponse.json({ error: 'Failed to delete licenses', details: licensesError.message }, { status: 500 });
    }

    // Delete the customer
    console.log(`[DELETE] Deleting customer: ${customerId}`);
    const { error: customerError } = await supabase
      .from('store_users')
      .delete()
      .eq('id', customerId);

    if (customerError) {
      console.error('[DELETE] Error deleting customer:', customerError);
      return NextResponse.json({ error: 'Failed to delete customer', details: customerError.message }, { status: 500 });
    }

    console.log(`[DELETE] Successfully deleted customer: ${customerId}`);
    return NextResponse.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('[DELETE] Exception:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

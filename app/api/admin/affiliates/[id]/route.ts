import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    
    const body = await request.json();
    const { status, commission_rate, payment_email, payment_method, minimum_payout, crypto_type, cashapp_tag } = body;
    const affiliateId = params.id;

    console.log('Updating affiliate:', affiliateId, 'with data:', body);

    // Build update data object
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (commission_rate !== undefined) updateData.commission_rate = commission_rate;
    if (payment_email !== undefined) updateData.payment_email = payment_email;
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (minimum_payout !== undefined) updateData.minimum_payout = minimum_payout;
    if (crypto_type !== undefined) updateData.crypto_type = crypto_type;
    if (cashapp_tag !== undefined) updateData.cashapp_tag = cashapp_tag;
    
    updateData.updated_at = new Date().toISOString();

    console.log('Update data:', updateData);

    const { data: affiliate, error: updateError } = await supabase
      .from('affiliates')
      .update(updateData)
      .eq('id', affiliateId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating affiliate:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update affiliate', 
        details: updateError.message 
      }, { status: 500 });
    }

    console.log('Successfully updated affiliate:', affiliate);

    return NextResponse.json({ success: true, affiliate });

  } catch (error) {
    console.error('Admin affiliate update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    
    const affiliateId = params.id;

    console.log('Deleting affiliate:', affiliateId);

    // First check if affiliate exists
    const { data: existingAffiliate, error: checkError } = await supabase
      .from('affiliates')
      .select('id, affiliate_code')
      .eq('id', affiliateId)
      .single();

    if (checkError || !existingAffiliate) {
      console.error('Affiliate not found:', checkError);
      return NextResponse.json({ 
        error: 'Affiliate not found', 
        details: checkError?.message 
      }, { status: 404 });
    }

    console.log('Found affiliate to delete:', existingAffiliate);

    // Delete affiliate (this will cascade delete related records due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('affiliates')
      .delete()
      .eq('id', affiliateId);

    if (deleteError) {
      console.error('Error deleting affiliate:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete affiliate', 
        details: deleteError.message 
      }, { status: 500 });
    }

    console.log('Successfully deleted affiliate:', affiliateId);

    return NextResponse.json({ success: true, message: 'Affiliate deleted successfully' });

  } catch (error) {
    console.error('Admin affiliate delete error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
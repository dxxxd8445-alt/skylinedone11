import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    
    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .select(`
        *,
        store_users!user_id(id, username, email)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });
    }

    return NextResponse.json({ affiliate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data: affiliate, error } = await supabase
      .from('affiliates')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ affiliate });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the ID from params - handle all possible cases
    let affiliateId = params?.id;
    
    console.log('[DELETE] Raw params:', JSON.stringify(params));
    console.log('[DELETE] affiliateId:', affiliateId, 'Type:', typeof affiliateId);
    
    // Validate the ID exists and is not undefined/null
    if (!affiliateId || affiliateId === 'undefined' || affiliateId === null || affiliateId === '') {
      console.error('[DELETE] Invalid affiliate ID - returning 400');
      return NextResponse.json({ 
        error: 'Invalid affiliate ID', 
        details: 'Affiliate ID is missing or undefined'
      }, { status: 400 });
    }

    // Trim whitespace just in case
    affiliateId = String(affiliateId).trim();
    
    if (!affiliateId) {
      console.error('[DELETE] Affiliate ID is empty after trim');
      return NextResponse.json({ 
        error: 'Invalid affiliate ID', 
        details: 'Affiliate ID is empty'
      }, { status: 400 });
    }

    console.log(`[DELETE] Starting deletion of affiliate: ${affiliateId}`);
    const supabase = createAdminClient();

    // Delete all referrals for this affiliate
    console.log(`[DELETE] Deleting referrals for affiliate: ${affiliateId}`);
    await supabase
      .from('affiliate_referrals')
      .delete()
      .eq('affiliate_id', affiliateId);

    // Delete all clicks for this affiliate
    console.log(`[DELETE] Deleting clicks for affiliate: ${affiliateId}`);
    await supabase
      .from('affiliate_clicks')
      .delete()
      .eq('affiliate_id', affiliateId);

    // Delete the affiliate
    console.log(`[DELETE] Deleting affiliate: ${affiliateId}`);
    const { error: affiliateError } = await supabase
      .from('affiliates')
      .delete()
      .eq('id', affiliateId);

    if (affiliateError) {
      console.error('[DELETE] Error deleting affiliate:', affiliateError);
      return NextResponse.json({ 
        error: 'Failed to delete affiliate', 
        details: affiliateError.message 
      }, { status: 500 });
    }

    console.log(`[DELETE] Successfully deleted affiliate: ${affiliateId}`);
    return NextResponse.json({ 
      success: true, 
      message: 'Affiliate deleted successfully',
      deletedId: affiliateId
    });
    
  } catch (error: any) {
    console.error('[DELETE] Exception:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

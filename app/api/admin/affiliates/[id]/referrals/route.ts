import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    
    const affiliateId = params.id;

    // Get affiliate referrals with graceful fallback
    const { data: referrals, error: referralsError } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError);
      
      // If table doesn't exist, return empty array instead of error
      if (referralsError.code === '42P01') {
        console.log('affiliate_referrals table does not exist, returning empty array');
        return NextResponse.json({ referrals: [] });
      }
      
      return NextResponse.json({ error: 'Failed to fetch referrals', details: referralsError.message }, { status: 500 });
    }

    return NextResponse.json({ referrals: referrals || [] });

  } catch (error) {
    console.error('Admin affiliate referrals error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
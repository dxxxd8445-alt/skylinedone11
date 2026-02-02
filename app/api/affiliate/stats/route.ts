import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStoreUserFromRequest } from '@/lib/store-session';

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated store user
    const user = await getStoreUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Get affiliate data
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('*')
      .eq('store_user_id', user.id)
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json({ error: 'Affiliate account not found' }, { status: 404 });
    }

    // Get referral stats
    const { data: referrals, error: referralsError } = await supabase
      .from('affiliate_referrals')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .order('created_at', { ascending: false });

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError);
      return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
    }

    // Get click stats for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: clicks, error: clicksError } = await supabase
      .from('affiliate_clicks')
      .select('*')
      .eq('affiliate_id', affiliate.id)
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (clicksError) {
      console.error('Error fetching clicks:', clicksError);
      return NextResponse.json({ error: 'Failed to fetch clicks' }, { status: 500 });
    }

    // Calculate stats
    const totalClicks = clicks?.length || 0;
    const totalReferrals = referrals?.length || 0;
    const conversionRate = totalClicks > 0 ? (totalReferrals / totalClicks * 100) : 0;
    
    const pendingEarnings = referrals?.filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + parseFloat(r.commission_amount), 0) || 0;
    
    const approvedEarnings = referrals?.filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + parseFloat(r.commission_amount), 0) || 0;
    
    const paidEarnings = referrals?.filter(r => r.status === 'paid')
      .reduce((sum, r) => sum + parseFloat(r.commission_amount), 0) || 0;

    // Get recent referrals (last 10)
    const recentReferrals = referrals?.slice(0, 10).map(r => ({
      id: r.id,
      referred_email: r.referred_email,
      commission_amount: parseFloat(r.commission_amount),
      status: r.status,
      created_at: r.created_at,
      order_amount: parseFloat(r.order_amount)
    })) || [];

    return NextResponse.json({
      affiliate: {
        id: affiliate.id,
        affiliate_code: affiliate.affiliate_code,
        commission_rate: parseFloat(affiliate.commission_rate),
        status: affiliate.status,
        payment_email: affiliate.payment_email,
        payment_method: affiliate.payment_method,
        crypto_type: affiliate.crypto_type,
        cashapp_tag: affiliate.cashapp_tag,
        total_earnings: parseFloat(affiliate.total_earnings),
        pending_earnings: parseFloat(affiliate.pending_earnings),
        paid_earnings: parseFloat(affiliate.paid_earnings),
        total_referrals: affiliate.total_referrals,
        total_sales: affiliate.total_sales
      },
      stats: {
        totalClicks,
        totalReferrals,
        conversionRate: Math.round(conversionRate * 100) / 100,
        pendingEarnings,
        approvedEarnings,
        paidEarnings,
        totalEarnings: pendingEarnings + approvedEarnings + paidEarnings
      },
      recentReferrals
    });

  } catch (error) {
    console.error('Affiliate stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { affiliate_code, landing_page, referrer } = await request.json();

    if (!affiliate_code) {
      return NextResponse.json({ error: 'Affiliate code is required' }, { status: 400 });
    }

    // Find affiliate by code
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('id, status')
      .eq('affiliate_code', affiliate_code)
      .eq('status', 'active')
      .single();

    if (affiliateError || !affiliate) {
      return NextResponse.json({ error: 'Invalid affiliate code' }, { status: 404 });
    }

    // Get client IP and user agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Track the click
    const { error: clickError } = await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_id: affiliate.id,
        ip_address: ip,
        user_agent: userAgent,
        referrer: referrer || null,
        landing_page: landing_page || '/'
      });

    if (clickError) {
      console.error('Error tracking click:', clickError);
      return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Affiliate tracking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
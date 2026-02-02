import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    
    const affiliateId = params.id;

    // Get affiliate clicks (last 30 days) with graceful fallback
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: clicks, error: clicksError } = await supabase
      .from('affiliate_clicks')
      .select('*')
      .eq('affiliate_id', affiliateId)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (clicksError) {
      console.error('Error fetching clicks:', clicksError);
      
      // If table doesn't exist, return empty array instead of error
      if (clicksError.code === '42P01') {
        console.log('affiliate_clicks table does not exist, returning empty array');
        return NextResponse.json({ clicks: [] });
      }
      
      return NextResponse.json({ error: 'Failed to fetch clicks', details: clicksError.message }, { status: 500 });
    }

    return NextResponse.json({ clicks: clicks || [] });

  } catch (error) {
    console.error('Admin affiliate clicks error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
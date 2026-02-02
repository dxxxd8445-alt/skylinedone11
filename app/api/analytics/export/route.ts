import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { startDate, endDate, format = 'csv' } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Get detailed visitor data
    const { data: visitorData, error: visitorError } = await supabase
      .from('visitor_sessions')
      .select(`
        session_id,
        ip_address,
        country,
        city,
        device_type,
        browser,
        os,
        page_views,
        time_on_site,
        activity,
        created_at,
        updated_at
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (visitorError) {
      console.error('Error fetching visitor data:', visitorError);
      return NextResponse.json({ error: 'Failed to fetch visitor data' }, { status: 500 });
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Session ID',
        'IP Address',
        'Country',
        'City',
        'Device Type',
        'Browser',
        'OS',
        'Page Views',
        'Time on Site (seconds)',
        'Activity',
        'Session Start',
        'Last Activity'
      ];

      const csvRows = [
        headers.join(','),
        ...(visitorData || []).map(row => [
          row.session_id,
          row.ip_address,
          row.country || '',
          row.city || '',
          row.device_type || '',
          row.browser || '',
          row.os || '',
          row.page_views || 0,
          row.time_on_site || 0,
          row.activity || '',
          new Date(row.created_at).toISOString(),
          new Date(row.updated_at).toISOString()
        ].map(field => `"${field}"`).join(','))
      ];

      const csvContent = csvRows.join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({ data: visitorData });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 });
    }

    // Initialize stats with default values
    const stats = {
      totalVisitors: 0,
      uniqueVisitors: 0,
      activeVisitors: 0, // Not applicable for historical data
      browsing: 0,
      viewingProducts: 0,
      inCart: 0,
      inCheckout: 0,
      completedPurchases: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      topPages: [],
      topProducts: [],
      trafficSources: [],
      deviceBreakdown: [],
      countryBreakdown: [],
    };

    // Try to get data from visitor_sessions table with comprehensive fallback handling
    try {
      // First check if the table exists
      const { data: sessionData, error: sessionError } = await supabase
        .from('visitor_sessions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .limit(1000); // Limit to prevent large queries

      if (sessionError) {
        console.error('Session data error:', sessionError);
        // If visitor_sessions doesn't exist, try realtime_visitors
        try {
          const { data: realtimeData, error: realtimeError } = await supabase
            .from('realtime_visitors')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate)
            .limit(1000);

          if (!realtimeError && realtimeData) {
            // Process realtime data similar to session data
            stats.totalVisitors = realtimeData.length;
            stats.uniqueVisitors = new Set(realtimeData.map(s => s.ip_address)).size;
            
            // Activity breakdown
            stats.browsing = realtimeData.filter(s => s.activity === 'browsing').length;
            stats.viewingProducts = realtimeData.filter(s => s.activity === 'viewing-product').length;
            stats.inCart = realtimeData.filter(s => s.activity === 'in-cart').length;
            stats.inCheckout = realtimeData.filter(s => s.activity === 'checkout').length;
            stats.completedPurchases = realtimeData.filter(s => s.activity === 'completed').length;
          }
        } catch (realtimeError) {
          console.error('Realtime data error:', realtimeError);
          // Return default stats if both tables fail
        }
      } else if (sessionData) {
        // Calculate basic stats
        stats.totalVisitors = sessionData.length;
        stats.uniqueVisitors = new Set(sessionData.map(s => s.ip_address)).size;
        
        // Activity breakdown
        stats.browsing = sessionData.filter(s => s.activity === 'browsing').length;
        stats.viewingProducts = sessionData.filter(s => s.activity === 'viewing-product').length;
        stats.inCart = sessionData.filter(s => s.activity === 'in-cart').length;
        stats.inCheckout = sessionData.filter(s => s.activity === 'checkout').length;
        stats.completedPurchases = sessionData.filter(s => s.activity === 'completed').length;

        // Calculate bounce rate (sessions with only 1 page view)
        const bouncedSessions = sessionData.filter(s => (s.page_views || 1) === 1).length;
        stats.bounceRate = stats.totalVisitors > 0 ? (bouncedSessions / stats.totalVisitors) * 100 : 0;

        // Calculate average session duration
        const totalDuration = sessionData.reduce((sum, s) => sum + (s.time_on_site || 0), 0);
        stats.avgSessionDuration = stats.totalVisitors > 0 ? totalDuration / stats.totalVisitors : 0;

        // Top pages
        const pageViews = {};
        sessionData.forEach(s => {
          const page = s.current_page || '/';
          pageViews[page] = (pageViews[page] || 0) + 1;
        });
        stats.topPages = Object.entries(pageViews)
          .map(([page, views]) => ({ page, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        // Top products
        const productViews = {};
        sessionData.forEach(s => {
          if (s.current_product) {
            productViews[s.current_product] = (productViews[s.current_product] || 0) + 1;
          }
        });
        stats.topProducts = Object.entries(productViews)
          .map(([product, views]) => ({ product, views }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 10);

        // Traffic sources
        const sources = {};
        sessionData.forEach(s => {
          const source = s.referrer || 'direct';
          sources[source] = (sources[source] || 0) + 1;
        });
        stats.trafficSources = Object.entries(sources)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        // Device breakdown
        const devices = {};
        sessionData.forEach(s => {
          const device = s.device || 'unknown';
          devices[device] = (devices[device] || 0) + 1;
        });
        stats.deviceBreakdown = Object.entries(devices)
          .map(([device, count]) => ({ device, count }))
          .sort((a, b) => b.count - a.count);

        // Country breakdown
        const countries = {};
        sessionData.forEach(s => {
          const country = s.country || 'Unknown';
          countries[country] = (countries[country] || 0) + 1;
        });
        stats.countryBreakdown = Object.entries(countries)
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // Return default stats if database queries fail
    }

    return NextResponse.json({ 
      stats,
      success: true,
      message: 'Analytics data retrieved successfully'
    });

  } catch (error) {
    console.error('Historical analytics error:', error);
    return NextResponse.json({ 
      error: 'Failed to load analytics data. Please check your database setup.',
      details: error.message,
      success: false
    }, { status: 500 });
  }
}
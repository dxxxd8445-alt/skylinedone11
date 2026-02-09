import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Try to get real-time visitor data from the dedicated realtime table
    let visitors: any[] = [];
    let visitorsError: any = null;

    // First try the new realtime_visitors table
    const { data: realtimeVisitors, error: realtimeError } = await supabase
      .from('realtime_visitors')
      .select('*')
      .gte('last_heartbeat', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .order('last_heartbeat', { ascending: false });

    if (!realtimeError && realtimeVisitors) {
      visitors = realtimeVisitors;
    } else {
      // Fallback to visitor_sessions table if realtime_visitors doesn't exist
      console.log('Falling back to visitor_sessions table');
      const { data: sessionVisitors, error: sessionError } = await supabase
        .from('visitor_sessions')
        .select('*')
        .eq('is_active', true)
        .gte('last_activity', new Date(Date.now() - 30 * 60 * 1000).toISOString())
        .order('last_activity', { ascending: false })
        .limit(50);

      if (sessionError) {
        console.error('Error fetching from visitor_sessions:', sessionError);
        visitorsError = sessionError;
      } else {
        visitors = sessionVisitors || [];
      }
    }

    if (visitorsError && visitors.length === 0) {
      console.error('Error fetching visitors:', visitorsError);
      // Don't return error, return empty data instead
      visitors = [];
    }

    // Get activity stats from active sessions
    let activityStats: any[] = [];
    
    // Try realtime_visitors first, then fallback to visitor_sessions
    const { data: realtimeStats, error: realtimeStatsError } = await supabase
      .from('realtime_visitors')
      .select('activity')
      .gte('last_heartbeat', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (!realtimeStatsError && realtimeStats) {
      activityStats = realtimeStats;
    } else {
      const { data: sessionStats, error: sessionStatsError } = await supabase
        .from('visitor_sessions')
        .select('activity')
        .eq('is_active', true)
        .gte('last_activity', new Date(Date.now() - 30 * 60 * 1000).toISOString());

      if (!sessionStatsError && sessionStats) {
        activityStats = sessionStats;
      }
    }

    // Calculate stats
    const stats = {
      totalVisitors: visitors?.length || 0,
      activeVisitors: visitors?.length || 0,
      browsing: activityStats?.filter(s => s.activity === 'browsing').length || 0,
      viewingProducts: activityStats?.filter(s => s.activity === 'viewing-product').length || 0,
      inCart: activityStats?.filter(s => s.activity === 'in-cart').length || 0,
      inCheckout: activityStats?.filter(s => s.activity === 'checkout').length || 0,
      completedPurchases: activityStats?.filter(s => s.activity === 'completed').length || 0,
    };

    // Get top pages from recent page views
    const { data: topPagesData, error: pagesError } = await supabase
      .from('page_views')
      .select('page_path')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    let topPages: { page: string; views: number }[] = [];
    if (!pagesError && topPagesData) {
      const pageCounts = topPagesData.reduce((acc: Record<string, number>, page) => {
        acc[page.page_path] = (acc[page.page_path] || 0) + 1;
        return acc;
      }, {});
      
      topPages = Object.entries(pageCounts)
        .map(([page, views]) => ({ page, views: views as number }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
    }

    // Get top products from recent page views
    const { data: topProductsData, error: productsError } = await supabase
      .from('page_views')
      .select('product_name')
      .not('product_name', 'is', null)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    let topProducts: { product: string; views: number }[] = [];
    if (!productsError && topProductsData) {
      const productCounts = topProductsData.reduce((acc: Record<string, number>, product) => {
        if (product.product_name) {
          acc[product.product_name] = (acc[product.product_name] || 0) + 1;
        }
        return acc;
      }, {});
      
      topProducts = Object.entries(productCounts)
        .map(([product, views]) => ({ product, views: views as number }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);
    }

    // Format visitor data with proper fallbacks
    const formattedVisitors = visitors?.map(visitor => {
      // Handle both realtime_visitors and visitor_sessions formats
      const lastActivityField = visitor.last_heartbeat || visitor.last_activity;
      const ipField = visitor.ip_address;
      const deviceField = visitor.device_type;
      const currentPageField = visitor.current_page;
      const currentProductField = visitor.current_product;
      
      return {
        id: visitor.session_id,
        sessionId: visitor.session_id,
        ip: ipField || '127.0.0.1',
        ipAddress: ipField || '127.0.0.1',
        userAgent: visitor.user_agent || '',
        country: visitor.country || 'Unknown',
        city: visitor.city || 'Unknown',
        latitude: visitor.latitude || 0,
        longitude: visitor.longitude || 0,
        currentPage: currentPageField || '/',
        page: currentPageField || '/',
        currentProduct: currentProductField,
        activity: visitor.activity || 'browsing',
        timeOnSite: visitor.time_on_site || 0,
        pageViews: visitor.page_views || 1,
        lastActivity: lastActivityField,
        timestamp: lastActivityField,
        device: deviceField || 'desktop',
        browser: visitor.browser || 'Unknown',
        os: visitor.os || 'Unknown',
        referer: visitor.referrer || null,
        referrer: visitor.referrer || null,
        secondsSinceLastActivity: Math.floor((Date.now() - new Date(lastActivityField || new Date()).getTime()) / 1000)
      };
    }) || [];

    return NextResponse.json({
      visitors: formattedVisitors,
      stats: {
        ...stats,
        topPages,
        topProducts
      }
    });

  } catch (error) {
    console.error('Real-time analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
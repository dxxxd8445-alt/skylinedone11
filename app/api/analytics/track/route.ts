import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Helper function to get real IP address
function getRealIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  // Fallback to connection IP (Note: request.ip may not be available in all environments)
  return '127.0.0.1';
}

// Helper function to parse user agent
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Detect device type
  let deviceType = 'desktop';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet';
  }
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  return { deviceType, browser, os };
}

// Helper function to get location from IP (you can integrate with a service like ipapi.co)
async function getLocationFromIP(ip: string) {
  try {
    // Skip location lookup for localhost/private IPs
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return { country: 'Local', city: 'Localhost', region: 'Development' };
    }
    
    // You can integrate with a real IP geolocation service here
    // For now, return mock data
    const mockLocations = [
      { country: 'United States', city: 'New York', region: 'NY' },
      { country: 'United States', city: 'Los Angeles', region: 'CA' },
      { country: 'Canada', city: 'Toronto', region: 'ON' },
      { country: 'United Kingdom', city: 'London', region: 'England' },
      { country: 'Germany', city: 'Berlin', region: 'Berlin' },
      { country: 'Australia', city: 'Sydney', region: 'NSW' },
    ];
    
    return mockLocations[Math.floor(Math.random() * mockLocations.length)];
  } catch (error) {
    return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    
    const {
      sessionId,
      page,
      product,
      activity = 'browsing',
      eventType = 'page_view',
      eventData = {},
      value = 0
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get real IP and parse user agent
    const ip = getRealIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const { deviceType, browser, os } = parseUserAgent(userAgent);
    const location = await getLocationFromIP(ip);
    const referrer = request.headers.get('referer') || '';

    // Check if session exists
    const { data: existingSession, error: selectError } = await supabase
      .from('visitor_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is expected for new sessions
      console.error('Error checking session:', selectError);
      // Don't fail the request, just skip session tracking
      return NextResponse.json({ success: true });
    }

    if (existingSession) {
      // Update existing session
      const { error: updateError } = await supabase
        .from('visitor_sessions')
        .update({
          current_page: page,
          current_product: product,
          activity,
          page_views: existingSession.page_views + 1,
          time_on_site: Math.floor((Date.now() - new Date(existingSession.created_at).getTime()) / 1000),
          last_activity: new Date().toISOString(),
          is_active: true
        })
        .eq('session_id', sessionId);

      if (updateError) {
        console.error('Error updating session:', updateError);
      }
    } else {
      // Create new session
      const { error: insertError } = await supabase
        .from('visitor_sessions')
        .insert({
          session_id: sessionId,
          ip_address: ip,
          user_agent: userAgent,
          country: location.country,
          city: location.city,
          region: location.region,
          current_page: page,
          current_product: product,
          activity,
          device_type: deviceType,
          browser,
          os,
          referrer: referrer || null,
          page_views: 1,
          time_on_site: 0,
          is_active: true
        });

      if (insertError) {
        console.error('Error creating session:', insertError);
        // Don't fail the request, just skip session tracking
        return NextResponse.json({ success: true });
      }
    }

    // Record page view (if table exists)
    try {
      const { error: pageViewError } = await supabase
        .from('page_views')
        .insert({
          session_id: sessionId,
          page_path: page,
          product_name: product,
          time_spent: 0
        });

      if (pageViewError) {
        console.log('Page view recording failed (table may not exist):', pageViewError.message);
      }
    } catch (pageViewError) {
      console.log('Page views table not available, skipping...');
    }

    // Record conversion event (if table exists)
    try {
      const { error: eventError } = await supabase
        .from('conversion_events')
        .insert({
          session_id: sessionId,
          event_type: eventType,
          event_data: eventData,
          value: value
        });

      if (eventError) {
        console.log('Conversion event recording failed (table may not exist):', eventError.message);
      }
    } catch (eventError) {
      console.log('Conversion events table not available, skipping...');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Return success anyway to not break the frontend
    return NextResponse.json({ success: true });
  }
}

// Cleanup inactive sessions
export async function DELETE() {
  try {
    const supabase = createAdminClient();
    
    const { data, error } = await supabase.rpc('cleanup_inactive_sessions');
    
    if (error) {
      console.error('Error cleaning up sessions:', error);
      return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }

    return NextResponse.json({ cleaned: data || 0 });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
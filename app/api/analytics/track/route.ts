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

// Mock geolocation data for localhost testing
const MOCK_LOCATIONS = [
  { country: 'United States', city: 'New York', region: 'NY', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York', isp: 'Test ISP' },
  { country: 'United Kingdom', city: 'London', region: 'England', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London', isp: 'Test ISP' },
  { country: 'Canada', city: 'Toronto', region: 'ON', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto', isp: 'Test ISP' },
  { country: 'Australia', city: 'Sydney', region: 'NSW', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney', isp: 'Test ISP' },
  { country: 'Germany', city: 'Berlin', region: 'Berlin', latitude: 52.5200, longitude: 13.4050, timezone: 'Europe/Berlin', isp: 'Test ISP' },
  { country: 'France', city: 'Paris', region: 'Île-de-France', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris', isp: 'Test ISP' },
  { country: 'Japan', city: 'Tokyo', region: 'Tokyo', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo', isp: 'Test ISP' },
  { country: 'Brazil', city: 'São Paulo', region: 'SP', latitude: -23.5505, longitude: -46.6333, timezone: 'America/Sao_Paulo', isp: 'Test ISP' },
  { country: 'India', city: 'Mumbai', region: 'Maharashtra', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata', isp: 'Test ISP' },
  { country: 'Singapore', city: 'Singapore', region: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore', isp: 'Test ISP' },
];

// Helper function to get location from IP using ipapi.co (free service)
async function getLocationFromIP(ip: string) {
  try {
    // For localhost/private IPs, use mock geolocation data for testing
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      // Return a random mock location for localhost testing
      const mockLocation = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
      return mockLocation;
    }
    
    // Use ipapi.co for free geolocation (no API key required)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!response.ok) {
      console.log(`Geolocation lookup failed for IP ${ip}: ${response.status}`);
      return { country: 'Unknown', city: 'Unknown', region: 'Unknown', latitude: 0, longitude: 0, timezone: 'Unknown', isp: 'Unknown' };
    }
    
    const data = await response.json();
    
    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || 'Unknown',
      isp: data.org || 'Unknown'
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return { country: 'Unknown', city: 'Unknown', region: 'Unknown', latitude: 0, longitude: 0, timezone: 'Unknown', isp: 'Unknown' };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Silently skip analytics if tables don't exist
    return NextResponse.json({ success: true });
    
    /* DISABLED ANALYTICS - UNCOMMENT WHEN TABLES ARE CREATED
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
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: location.timezone,
          isp: location.isp,
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
    */
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
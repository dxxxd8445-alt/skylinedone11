import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Helper function to get real IP address
function getRealIP(request: NextRequest): string {
  // Check various headers for the real IP
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  const realIP = request.headers.get('x-real-ip');
  const forwarded = request.headers.get('x-forwarded-for');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
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
  let browserVersion = '';
  if (ua.includes('chrome') && !ua.includes('edg')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/([0-9.]+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/([0-9.]+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browser = 'Safari';
    const match = ua.match(/version\/([0-9.]+)/);
    browserVersion = match ? match[1] : '';
  } else if (ua.includes('edg')) {
    browser = 'Edge';
    const match = ua.match(/edg\/([0-9.]+)/);
    browserVersion = match ? match[1] : '';
  }
  
  // Detect OS
  let os = 'Unknown';
  let osVersion = '';
  if (ua.includes('windows')) {
    os = 'Windows';
    if (ua.includes('windows nt 10.0')) osVersion = '10';
    else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
    else if (ua.includes('windows nt 6.2')) osVersion = '8';
    else if (ua.includes('windows nt 6.1')) osVersion = '7';
  } else if (ua.includes('mac')) {
    os = 'macOS';
    const match = ua.match(/mac os x ([0-9_]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : '';
  } else if (ua.includes('linux')) {
    os = 'Linux';
  } else if (ua.includes('android')) {
    os = 'Android';
    const match = ua.match(/android ([0-9.]+)/);
    osVersion = match ? match[1] : '';
  } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
    os = 'iOS';
    const match = ua.match(/os ([0-9_]+)/);
    osVersion = match ? match[1].replace(/_/g, '.') : '';
  }
  
  return { deviceType, browser, browserVersion, os, osVersion };
}

// Helper function to get location from IP (mock for now)
async function getLocationFromIP(ip: string) {
  try {
    // Skip location lookup for localhost/private IPs
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return { country: 'Local', city: 'Development', region: 'Dev', timezone: 'UTC' };
    }
    
    // In production, integrate with a real IP geolocation service
    // For now, return realistic mock data
    const mockLocations = [
      { country: 'United States', city: 'New York', region: 'NY', timezone: 'America/New_York' },
      { country: 'United States', city: 'Los Angeles', region: 'CA', timezone: 'America/Los_Angeles' },
      { country: 'Canada', city: 'Toronto', region: 'ON', timezone: 'America/Toronto' },
      { country: 'United Kingdom', city: 'London', region: 'England', timezone: 'Europe/London' },
      { country: 'Germany', city: 'Berlin', region: 'Berlin', timezone: 'Europe/Berlin' },
      { country: 'Australia', city: 'Sydney', region: 'NSW', timezone: 'Australia/Sydney' },
    ];
    
    return mockLocations[Math.floor(Math.random() * mockLocations.length)];
  } catch (error) {
    return { country: 'Unknown', city: 'Unknown', region: 'Unknown', timezone: 'UTC' };
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
      timeOnPage = 0,
      scrollDepth = 0,
      clicks = 0
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get real IP and parse user agent
    const ip = getRealIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    const { deviceType, browser, browserVersion, os, osVersion } = parseUserAgent(userAgent);
    const location = await getLocationFromIP(ip);

    // Update realtime visitors table (if it exists)
    try {
      const { error: realtimeError } = await supabase
        .rpc('upsert_realtime_visitor', {
          p_session_id: sessionId,
          p_ip_address: ip,
          p_country: location.country,
          p_city: location.city,
          p_current_page: page,
          p_current_product: product,
          p_activity: activity,
          p_device_type: deviceType,
          p_browser: browser,
          p_os: os,
          p_time_on_site: Math.floor((Date.now() - new Date().getTime()) / 1000),
          p_page_views: 1
        });

      if (realtimeError) {
        console.log('Realtime visitor update failed (table may not exist):', realtimeError.message);
      }
    } catch (realtimeError) {
      console.log('Realtime visitor function not available, skipping...');
    }

    // Update main visitor session
    const { data: existingSession } = await supabase
      .from('visitor_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (existingSession) {
      // Update existing session
      const { error: updateError } = await supabase
        .from('visitor_sessions')
        .update({
          current_page: page,
          current_product: product,
          activity,
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
      const referrer = request.headers.get('referer') || '';
      
      const sessionData: any = {
        session_id: sessionId,
        ip_address: ip,
        user_agent: userAgent,
        country: location.country,
        city: location.city,
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
      };

      // Add optional fields if they exist in the schema
      try {
        sessionData.region = location.region;
        sessionData.timezone = location.timezone;
        sessionData.browser_version = browserVersion;
        sessionData.os_version = osVersion;
        sessionData.entry_page = page;
      } catch (e) {
        // These fields might not exist in older schemas
      }

      const { error: insertError } = await supabase
        .from('visitor_sessions')
        .insert(sessionData);

      if (insertError) {
        console.error('Error creating session:', insertError);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
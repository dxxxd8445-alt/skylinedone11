import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const config = {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!supabaseServiceKey,
      url: supabaseUrl,
      anonKeyLength: supabaseAnonKey?.length || 0,
      serviceKeyLength: supabaseServiceKey?.length || 0
    };

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: "Missing Supabase configuration",
        config
      }, { status: 500 });
    }

    // Try to create client with anon key
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Test basic connection
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    return NextResponse.json({
      success: true,
      message: "Connection test completed",
      config,
      connectionTest: {
        attempted: true,
        error: error?.message || null,
        canConnect: !error || error.message.includes('does not exist')
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
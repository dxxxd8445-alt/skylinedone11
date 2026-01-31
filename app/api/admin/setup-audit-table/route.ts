import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    console.log('🔧 Creating admin_audit_logs table...');

    // First, try to create the table using a simple insert to test if it exists
    const { error: testError } = await supabase
      .from('admin_audit_logs')
      .select('id')
      .limit(1);

    if (testError && testError.code === '42P01') {
      // Table doesn't exist, we need to create it
      // Since we can't use SQL directly, let's return instructions
      return NextResponse.json({
        success: false,
        error: "Table doesn't exist",
        instructions: `
Please run this SQL in your Supabase SQL Editor:

CREATE TABLE admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('login', 'logout')),
  actor_role TEXT NOT NULL CHECK (actor_role IN ('admin', 'staff')),
  actor_identifier TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_logs_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX idx_admin_audit_logs_actor ON admin_audit_logs(actor_role, actor_identifier);
CREATE INDEX idx_admin_audit_logs_event_type ON admin_audit_logs(event_type);

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage audit logs" ON admin_audit_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Insert a test record
INSERT INTO admin_audit_logs (event_type, actor_role, actor_identifier, ip_address, user_agent) 
VALUES ('login', 'admin', 'setup-test', '127.0.0.1', 'Setup API');
        `,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
      }, { status: 400 });
    }

    // Table exists, test it
    const { error: insertError } = await supabase
      .from('admin_audit_logs')
      .insert({
        event_type: 'login',
        actor_role: 'admin',
        actor_identifier: 'api-test',
        ip_address: '127.0.0.1',
        user_agent: 'Setup API Test'
      });

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: `Table exists but insert failed: ${insertError.message}`,
        details: insertError
      }, { status: 500 });
    }

    // Clean up test record
    await supabase
      .from('admin_audit_logs')
      .delete()
      .eq('actor_identifier', 'api-test');

    return NextResponse.json({
      success: true,
      message: 'admin_audit_logs table is working correctly!'
    });

  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Setup failed',
      details: error
    }, { status: 500 });
  }
}
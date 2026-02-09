import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    
    // Test database connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('settings')
      .select('count')
      .limit(1);

    if (connectionError) {
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionError.message
      }, { status: 500 });
    }

    // Check all required tables exist
    const requiredTables = [
      'categories', 'products', 'product_variants', 'orders', 'licenses',
      'coupons', 'reviews', 'team_members', 'webhooks', 'settings', 'admin_audit_logs'
    ];

    const tableChecks = await Promise.all(
      requiredTables.map(async (table) => {
        try {
          const { error } = await supabase.from(table).select('count').limit(1);
          return { table, exists: !error, error: error?.message };
        } catch (e: any) {
          return { table, exists: false, error: e.message };
        }
      })
    );

    const missingTables = tableChecks.filter(check => !check.exists);

    // Check sample data
    const { data: products } = await supabase.from('products').select('count');
    const { data: categories } = await supabase.from('categories').select('count');
    const { data: teamMembers } = await supabase.from('team_members').select('count');

    // Test admin authentication
    const { data: adminUser } = await supabase
      .from('team_members')
      .select('id, name, email, role, permissions')
      .eq('email', 'admin@skyline.local')
      .single();

    return NextResponse.json({
      success: missingTables.length === 0,
      database: {
        connected: true,
        tables: {
          total: requiredTables.length,
          existing: tableChecks.filter(t => t.exists).length,
          missing: missingTables.map(t => t.table)
        }
      },
      sampleData: {
        products: products?.length || 0,
        categories: categories?.length || 0,
        teamMembers: teamMembers?.length || 0
      },
      adminUser: adminUser ? {
        exists: true,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        hasPermissions: Array.isArray(adminUser.permissions) && adminUser.permissions.length > 0
      } : {
        exists: false
      },
      tableDetails: tableChecks,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Setup verification failed",
      details: error.message
    }, { status: 500 });
  }
}
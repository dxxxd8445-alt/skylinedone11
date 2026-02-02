import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    const { data: customers, error } = await supabase
      .from('store_users')
      .select('id, email, username, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ customers: customers || [] });
  } catch (error: any) {
    console.error('Customers API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

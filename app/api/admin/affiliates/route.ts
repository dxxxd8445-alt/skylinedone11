import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    console.log('Admin affiliates API called'); // Debug log
    
    // Get affiliates with user data - try multiple approaches
    let affiliates = null;
    let error = null;

    // First try with store_users join using explicit foreign key
    const { data: affiliatesWithUsers, error: joinError } = await supabase
      .from('affiliates')
      .select(`
        *,
        store_users!store_user_id (
          username,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (joinError) {
      console.error('Error with store_users join:', joinError);
      
      // Fallback: try without join
      const { data: affiliatesOnly, error: simpleError } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (simpleError) {
        console.error('Error fetching affiliates (simple):', simpleError);
        return NextResponse.json({ error: 'Failed to fetch affiliates', details: simpleError.message }, { status: 500 });
      }

      affiliates = affiliatesOnly;
      console.log('Fetched affiliates without join:', affiliates?.length || 0);
    } else {
      affiliates = affiliatesWithUsers;
      console.log('Fetched affiliates with join:', affiliates?.length || 0);
    }

    // If we have affiliates but no store_users data, try to fetch user data separately
    if (affiliates && affiliates.length > 0 && !affiliates[0].store_users) {
      console.log('Attempting to fetch store_users data separately...');
      
      for (let affiliate of affiliates) {
        if (affiliate.store_user_id) {
          const { data: userData } = await supabase
            .from('store_users')
            .select('username, email')
            .eq('id', affiliate.store_user_id)
            .single();
          
          if (userData) {
            affiliate.store_users = userData;
          }
        }
      }
    }

    console.log('Final affiliates data:', JSON.stringify(affiliates, null, 2));

    return NextResponse.json({ 
      affiliates: affiliates || [],
      debug: {
        count: affiliates?.length || 0,
        hasStoreUsers: affiliates?.[0]?.store_users ? true : false
      }
    });

  } catch (error) {
    console.error('Admin affiliates error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
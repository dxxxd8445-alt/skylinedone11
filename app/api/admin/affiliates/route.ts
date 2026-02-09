import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    console.log('Admin affiliates API called');
    
    // Get all affiliates
    const { data: affiliates, error: affiliatesError } = await supabase
      .from('affiliates')
      .select(`
        id,
        store_user_id,
        affiliate_code,
        commission_rate,
        total_earnings,
        pending_earnings,
        paid_earnings,
        total_referrals,
        total_sales,
        status,
        payment_email,
        payment_method,
        crypto_type,
        cashapp_tag,
        minimum_payout,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (affiliatesError) {
      console.error('Error fetching affiliates:', affiliatesError);
      return NextResponse.json({ error: 'Failed to fetch affiliates', details: affiliatesError.message }, { status: 500 });
    }

    console.log(`Fetched ${affiliates?.length || 0} affiliates`);

    // For each affiliate, fetch the store_user data
    const affiliatesWithUsers = await Promise.all(
      (affiliates || []).map(async (affiliate) => {
        console.log(`Processing affiliate ${affiliate.id} with store_user_id: ${affiliate.store_user_id}`);
        
        if (affiliate.store_user_id) {
          try {
            const { data: userData, error: userError } = await supabase
              .from('store_users')
              .select('id, username, email')
              .eq('id', affiliate.store_user_id)
              .single();
            
            if (userError) {
              console.warn(`Could not find user for affiliate ${affiliate.id}:`, userError.message);
              // Use affiliate code as fallback username
              return {
                ...affiliate,
                store_users: { 
                  username: affiliate.affiliate_code || 'Affiliate', 
                  email: affiliate.payment_email || 'No email' 
                }
              };
            }

            console.log(`Found user for affiliate ${affiliate.id}:`, userData);
            
            return {
              ...affiliate,
              store_users: userData || { 
                username: affiliate.affiliate_code || 'Affiliate', 
                email: affiliate.payment_email || 'No email' 
              }
            };
          } catch (err) {
            console.error(`Error fetching user for affiliate ${affiliate.id}:`, err);
            return {
              ...affiliate,
              store_users: { 
                username: affiliate.affiliate_code || 'Affiliate', 
                email: affiliate.payment_email || 'No email' 
              }
            };
          }
        }
        
        return {
          ...affiliate,
          store_users: { 
            username: affiliate.affiliate_code || 'Affiliate', 
            email: affiliate.payment_email || 'No email' 
          }
        };
      })
    );

    console.log('Fetched affiliates with user data:', affiliatesWithUsers?.length || 0);

    return NextResponse.json({ 
      affiliates: affiliatesWithUsers || [],
      debug: {
        count: affiliatesWithUsers?.length || 0,
        hasStoreUsers: affiliatesWithUsers?.[0]?.store_users ? true : false
      }
    });

  } catch (error) {
    console.error('Admin affiliates error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}

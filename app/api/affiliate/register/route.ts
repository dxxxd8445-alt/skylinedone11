import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStoreUserFromRequest } from '@/lib/store-session';

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Affiliate registration API called');
    
    // Parse body first
    const body = await request.json();
    const { payment_email, payment_method = 'paypal', crypto_type, cashapp_tag } = body;
    
    // Try to get user from store session
    let user = await getStoreUserFromRequest(request);
    
    console.log('🔵 Store user from session:', user ? { id: user.id, email: user.email } : 'NOT FOUND');
    
    // If no store session, try to get from database by email
    if (!user && body.user_email) {
      console.log('🔵 Trying to find user by email:', body.user_email);
      const supabase = createAdminClient();
      const { data: storeUser } = await supabase
        .from('store_users')
        .select('id, email, username')
        .eq('email', body.user_email)
        .maybeSingle();
      
      if (storeUser) {
        user = storeUser;
        console.log('🔵 Found user by email:', user.email);
      }
    }
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized - Please sign in to your customer account' }, { status: 401 });
    }

    console.log('🔵 Registration data:', { payment_email, payment_method, crypto_type, cashapp_tag, user_id: user.id });

    // Validate based on payment method
    if (payment_method === 'paypal') {
      if (!payment_email) {
        return NextResponse.json({ error: 'PayPal email is required' }, { status: 400 });
      }
    } else if (payment_method === 'cashapp') {
      if (!cashapp_tag) {
        return NextResponse.json({ error: 'Cash App tag is required' }, { status: 400 });
      }
    } else if (payment_method === 'crypto') {
      if (!crypto_type) {
        return NextResponse.json({ error: 'Crypto type is required' }, { status: 400 });
      }
      if (!payment_email) {
        return NextResponse.json({ error: 'Crypto address is required' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check if user already has an affiliate account
    console.log('🔵 Checking for existing affiliate with store_user_id:', user.id);
    const { data: existingAffiliate, error: checkError } = await supabase
      .from('affiliates')
      .select('id')
      .eq('store_user_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Error checking existing affiliate:', checkError);
      return NextResponse.json({ error: 'Database error', details: checkError.message }, { status: 500 });
    }

    if (existingAffiliate) {
      console.log('❌ User already has affiliate account:', existingAffiliate.id);
      return NextResponse.json({ error: 'You already have an affiliate account' }, { status: 400 });
    }

    // Generate unique affiliate code
    const generateCode = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    let affiliateCode = generateCode();
    let codeExists = true;
    let attempts = 0;

    while (codeExists && attempts < 10) {
      const { data: existingCode } = await supabase
        .from('affiliates')
        .select('id')
        .eq('affiliate_code', affiliateCode)
        .maybeSingle();
      
      if (!existingCode) {
        codeExists = false;
      } else {
        affiliateCode = generateCode();
        attempts++;
      }
    }

    if (attempts >= 10) {
      console.error('❌ Failed to generate unique affiliate code');
      return NextResponse.json({ error: 'Failed to generate unique affiliate code' }, { status: 500 });
    }

    console.log('🔵 Generated affiliate code:', affiliateCode);

    // Prepare payment details based on method
    let paymentDetails: any = {
      payment_method: payment_method
    };
    
    if (payment_method === 'paypal') {
      paymentDetails.payment_email = payment_email;
    } else if (payment_method === 'cashapp') {
      paymentDetails.payment_email = cashapp_tag;
      paymentDetails.cashapp_tag = cashapp_tag;
    } else if (payment_method === 'crypto') {
      paymentDetails.payment_email = payment_email;
      paymentDetails.crypto_type = crypto_type;
    }

    // Create affiliate account with default values
    const affiliateData = {
      store_user_id: user.id,
      affiliate_code: affiliateCode,
      ...paymentDetails,
      status: 'active',
      commission_rate: 10,
      total_earnings: 0,
      pending_earnings: 0,
      paid_earnings: 0,
      total_referrals: 0,
      total_sales: 0,
      minimum_payout: 50
    };

    console.log('🔵 Creating affiliate with data:', JSON.stringify(affiliateData, null, 2));

    const { data: affiliate, error: createError } = await supabase
      .from('affiliates')
      .insert([affiliateData])
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating affiliate:', createError);
      console.error('❌ Error code:', createError.code);
      console.error('❌ Error message:', createError.message);
      return NextResponse.json({ 
        error: 'Failed to create affiliate account', 
        details: createError.message,
        code: createError.code
      }, { status: 500 });
    }

    console.log('✅ Successfully created affiliate:', affiliate.id);

    return NextResponse.json({ 
      success: true, 
      affiliate: {
        id: affiliate.id,
        affiliate_code: affiliate.affiliate_code,
        commission_rate: affiliate.commission_rate,
        status: affiliate.status,
        payment_email: affiliate.payment_email,
        payment_method: affiliate.payment_method,
        crypto_type: affiliate.crypto_type,
        cashapp_tag: affiliate.cashapp_tag
      }
    });

  } catch (error: any) {
    console.error('❌ Affiliate registration error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

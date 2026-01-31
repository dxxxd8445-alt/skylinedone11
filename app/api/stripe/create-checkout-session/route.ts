import { NextRequest, NextResponse } from 'next/server';
import { stripe, createStripeLineItems, formatAmountForStripe, STRIPE_CONFIG } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      items, 
      customer_email, 
      coupon_code, 
      coupon_discount_amount,
      success_url, 
      cancel_url 
    } = body;

    console.log('🛒 Creating Stripe checkout session:', {
      itemCount: items?.length,
      customerEmail: customer_email,
      couponCode: coupon_code,
      discountAmount: coupon_discount_amount
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('❌ No items provided');
      return NextResponse.json(
        { error: 'No items provided' },
        { status: 400 }
      );
    }

    if (!customer_email) {
      console.error('❌ Customer email is required');
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Create line items for Stripe
    const lineItems = createStripeLineItems(items);
    console.log('📦 Created line items:', lineItems);

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const discountAmount = coupon_discount_amount || 0;
    const total = Math.max(0, subtotal - discountAmount);

    console.log('💰 Calculated totals:', { subtotal, discountAmount, total });

    // Create checkout session parameters
    const sessionParams: any = {
      payment_method_types: STRIPE_CONFIG.payment_method_types,
      mode: STRIPE_CONFIG.mode,
      line_items: lineItems,
      success_url: success_url || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_SITE_URL}/payment/cancelled`,
      customer_email,
      billing_address_collection: STRIPE_CONFIG.billing_address_collection,
      metadata: {
        customer_email,
        coupon_code: coupon_code || '',
        coupon_discount_amount: discountAmount.toString(),
        item_count: items.length.toString(),
        subtotal: subtotal.toString(),
        total: total.toString(),
      },
      // Add custom fields for additional customer information
      custom_fields: [
        {
          key: 'discord_username',
          label: {
            type: 'custom',
            custom: 'Discord Username (Optional)',
          },
          type: 'text',
          optional: true,
        },
      ],
    };

    // Add discount if coupon is applied
    if (coupon_code && discountAmount > 0) {
      console.log('🎫 Creating Stripe coupon for discount');
      // Create a discount coupon in Stripe for this session
      const stripeCoupon = await stripe.coupons.create({
        amount_off: formatAmountForStripe(discountAmount),
        currency: STRIPE_CONFIG.currency,
        duration: 'once',
        name: `Coupon: ${coupon_code}`,
        metadata: {
          original_code: coupon_code,
          discount_amount: discountAmount.toString(),
        },
      });

      sessionParams.discounts = [{
        coupon: stripeCoupon.id,
      }];
    }

    console.log('🔄 Creating Stripe checkout session...');
    // Create the checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log('✅ Stripe session created:', session.id);

    // Store session information in database for webhook processing
    const supabase = createAdminClient();
    try {
      console.log('💾 Storing session in database...');
      const { error: dbError } = await supabase.from('stripe_sessions').insert({
        session_id: session.id,
        customer_email,
        items: JSON.stringify(items),
        coupon_code: coupon_code || null,
        coupon_discount_amount: discountAmount,
        subtotal,
        total,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      if (dbError) {
        console.warn('⚠️ Failed to store session in database:', dbError);
        // Don't fail the checkout if database storage fails
      } else {
        console.log('✅ Session stored in database');
      }
    } catch (dbError) {
      console.warn('⚠️ Database storage error:', dbError);
      // Don't fail the checkout if database storage fails
    }

    console.log('🎉 Checkout session created successfully');
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error: any) {
    console.error('❌ Stripe checkout session creation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
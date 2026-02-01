import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountFromStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { headers } from 'next/headers';
import { triggerWebhooks } from '@/lib/discord-webhook';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    console.error('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        console.log('🎉 Checkout session completed:', session.id);

        // Get session details with line items
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items', 'line_items.data.price.product'],
        });

        // Update session status in database
        await supabase
          .from('stripe_sessions')
          .update({ 
            status: 'completed',
            stripe_payment_intent_id: session.payment_intent,
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', session.id);

        // Find and update the pending order
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_session_id', session.id)
          .single();

        let order;
        if (existingOrder) {
          // Update existing pending order
          const { data: updatedOrder, error: updateError } = await supabase
            .from('orders')
            .update({
              status: 'completed',
              payment_intent_id: session.payment_intent,
              billing_address: JSON.stringify(session.customer_details?.address),
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingOrder.id)
            .select()
            .single();

          if (updateError) {
            console.error('Failed to update existing order:', updateError);
            throw updateError;
          }
          order = updatedOrder;
          console.log('✅ Updated existing order:', order.order_number);
        } else {
          // Create new order if none exists (fallback)
          const orderData = {
            order_number: `STRIPE-${session.id.slice(-8).toUpperCase()}`,
            customer_email: session.customer_details?.email || session.metadata?.customer_email,
            customer_name: session.customer_details?.name || 'Unknown',
            amount_cents: session.amount_total || 0,
            currency: session.currency?.toUpperCase() || 'USD',
            status: 'completed',
            payment_method: 'stripe',
            payment_intent_id: session.payment_intent,
            stripe_session_id: session.id,
            billing_address: JSON.stringify(session.customer_details?.address),
            coupon_code: session.metadata?.coupon_code || null,
            coupon_discount_amount: session.metadata?.coupon_discount_amount ? 
              parseFloat(session.metadata.coupon_discount_amount) : null,
            metadata: JSON.stringify({
              stripe_session: session.id,
              customer_details: session.customer_details,
              custom_fields: session.custom_fields,
            }),
            created_at: new Date().toISOString(),
          };

          const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

          if (orderError) {
            console.error('Failed to create order:', orderError);
            throw orderError;
          }
          order = newOrder;
          console.log('✅ Created new order:', order.order_number);
        }

        // Process each line item to create licenses
        if (fullSession.line_items?.data) {
          for (const lineItem of fullSession.line_items.data) {
            const product = lineItem.price?.product as any;
            const quantity = lineItem.quantity || 1;
            
            // Extract product metadata
            const productId = product?.metadata?.product_id;
            const variantId = product?.metadata?.variant_id;
            const game = product?.metadata?.game;

            if (!productId) {
              console.warn('Missing product_id in line item metadata');
              continue;
            }

            // Get product details from database
            const { data: productData } = await supabase
              .from('products')
              .select('name')
              .eq('id', productId)
              .single();

            // Create licenses for this line item
            for (let i = 0; i < quantity; i++) {
              // Get an unused license key for this product/variant
              const { data: availableLicense } = await supabase
                .from('licenses')
                .select('*')
                .eq('product_id', productId)
                .eq('variant_id', variantId || null)
                .eq('status', 'unused')
                .limit(1)
                .single();

              if (availableLicense) {
                // Assign the license to the customer
                await supabase
                  .from('licenses')
                  .update({
                    status: 'active',
                    customer_email: order.customer_email,
                    order_id: order.id,
                    assigned_at: new Date().toISOString(),
                  })
                  .eq('id', availableLicense.id);

                console.log(`✅ License assigned: ${availableLicense.license_key}`);
              } else {
                console.warn(`⚠️ No available license for product ${productId}, variant ${variantId}`);
                
                // Create a placeholder license record to track the sale
                await supabase.from('licenses').insert({
                  product_id: productId,
                  variant_id: variantId || null,
                  product_name: productData?.name || 'Unknown Product',
                  license_key: `PENDING-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                  status: 'pending',
                  customer_email: order.customer_email,
                  order_id: order.id,
                  assigned_at: new Date().toISOString(),
                  created_at: new Date().toISOString(),
                });
              }
            }
          }
        }

        // Update coupon usage if applicable
        if (session.metadata?.coupon_code) {
          const { data: coupon } = await supabase
            .from('coupons')
            .select('current_uses')
            .eq('code', session.metadata.coupon_code.toUpperCase())
            .single();

          if (coupon) {
            await supabase
              .from('coupons')
              .update({ 
                current_uses: (coupon.current_uses || 0) + 1,
                updated_at: new Date().toISOString(),
              })
              .eq('code', session.metadata.coupon_code.toUpperCase());
          }
        }

        console.log('🎉 Payment processing completed for session:', session.id);

        // Trigger Discord webhooks for completed order
        await triggerWebhooks('payment.completed', {
          order_number: order.order_number,
          customer_email: order.customer_email,
          customer_name: order.customer_name || session.customer_details?.name || 'Unknown',
          amount: formatAmountFromStripe(order.amount_cents),
          currency: order.currency,
          payment_intent_id: session.payment_intent,
          stripe_session_id: session.id,
          items: fullSession.line_items?.data?.map(item => ({
            name: (item.price?.product as any)?.name || 'Unknown Product',
            quantity: item.quantity || 1,
            price: formatAmountFromStripe(item.amount_total || 0),
          })) || [],
        });

        // Also trigger order.completed event
        await triggerWebhooks('order.completed', {
          order_number: order.order_number,
          customer_email: order.customer_email,
          customer_name: order.customer_name || session.customer_details?.name || 'Unknown',
          amount: formatAmountFromStripe(order.amount_cents),
          currency: order.currency,
          status: 'completed',
          items: fullSession.line_items?.data?.map(item => ({
            name: (item.price?.product as any)?.name || 'Unknown Product',
            quantity: item.quantity || 1,
            price: formatAmountFromStripe(item.amount_total || 0),
          })) || [],
        });
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as any;
        console.log('⏰ Checkout session expired:', session.id);

        // Update session status
        await supabase
          .from('stripe_sessions')
          .update({ 
            status: 'expired',
            updated_at: new Date().toISOString(),
          })
          .eq('session_id', session.id);

        // Update any related pending orders to failed
        const { data: expiredOrder } = await supabase
          .from('orders')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_session_id', session.id)
          .select()
          .single();

        if (expiredOrder) {
          // Trigger webhook for expired/failed order
          await triggerWebhooks('payment.failed', {
            order_number: expiredOrder.order_number,
            customer_email: expiredOrder.customer_email,
            amount: formatAmountFromStripe(expiredOrder.amount_cents),
            currency: expiredOrder.currency,
            error_message: 'Checkout session expired - customer did not complete payment',
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        console.log('❌ Payment failed:', paymentIntent.id);

        // Update any related orders
        const { data: failedOrders } = await supabase
          .from('orders')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent_id', paymentIntent.id)
          .select();

        // Trigger Discord webhooks for failed payment
        if (failedOrders && failedOrders.length > 0) {
          for (const failedOrder of failedOrders) {
            await triggerWebhooks('payment.failed', {
              payment_intent_id: paymentIntent.id,
              order_number: failedOrder.order_number,
              customer_email: failedOrder.customer_email,
              customer_name: failedOrder.customer_name,
              amount: formatAmountFromStripe(failedOrder.amount_cents),
              currency: failedOrder.currency,
              error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
            });
          }
        } else {
          // Fallback webhook if no order found
          await triggerWebhooks('payment.failed', {
            payment_intent_id: paymentIntent.id,
            customer_email: paymentIntent.receipt_email,
            amount: formatAmountFromStripe(paymentIntent.amount || 0),
            currency: paymentIntent.currency?.toUpperCase(),
            error_message: paymentIntent.last_payment_error?.message || 'Payment failed',
          });
        }
        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as any;
        console.log('⚖️ Dispute created:', dispute.id);

        // Find related order by payment intent
        const { data: disputedOrder } = await supabase
          .from('orders')
          .select('*')
          .eq('payment_intent_id', dispute.payment_intent)
          .single();

        if (disputedOrder) {
          // Update order status to disputed
          await supabase
            .from('orders')
            .update({
              status: 'disputed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', disputedOrder.id);

          // Revoke any associated licenses
          await supabase
            .from('licenses')
            .update({
              status: 'revoked',
              updated_at: new Date().toISOString(),
            })
            .eq('order_id', disputedOrder.id);

          // Trigger webhook for dispute
          await triggerWebhooks('order.disputed', {
            order_number: disputedOrder.order_number,
            customer_email: disputedOrder.customer_email,
            customer_name: disputedOrder.customer_name,
            amount: formatAmountFromStripe(disputedOrder.amount_cents),
            currency: disputedOrder.currency,
            dispute_reason: dispute.reason,
            dispute_amount: formatAmountFromStripe(dispute.amount),
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
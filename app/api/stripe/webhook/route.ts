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
              payment_intent_id: session.payment_intent as string,
              customer_name: session.customer_details?.name || existingOrder.customer_name || 'Unknown Customer',
              currency: (session.currency || existingOrder.currency || 'usd').toUpperCase(),
              billing_address: session.customer_details?.address ? JSON.stringify(session.customer_details.address) : existingOrder.billing_address,
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
          // Extract product info from first line item for order details
          const firstLineItem = fullSession.line_items?.data?.[0];
          const firstProduct = firstLineItem?.price?.product as any;
          
          const orderData = {
            order_number: `STRIPE-${session.id.slice(-8).toUpperCase()}`,
            customer_email: session.customer_details?.email || session.metadata?.customer_email || 'unknown@example.com',
            customer_name: session.customer_details?.name || session.metadata?.customer_name || 'Unknown Customer',
            amount_cents: session.amount_total || 0,
            currency: (session.currency || 'usd').toUpperCase(),
            status: 'completed',
            payment_method: 'stripe',
            payment_intent_id: session.payment_intent as string,
            stripe_session_id: session.id,
            billing_address: session.customer_details?.address ? JSON.stringify(session.customer_details.address) : null,
            coupon_code: session.metadata?.coupon_code || null,
            coupon_discount_amount: session.metadata?.coupon_discount_amount ? 
              parseFloat(session.metadata.coupon_discount_amount) : null,
            // Add product info from first line item
            product_id: firstProduct?.metadata?.product_id || null,
            variant_id: firstProduct?.metadata?.variant_id || null,
            product_name: firstProduct?.name || 'Digital Product',
            duration: firstProduct?.metadata?.duration || null,
            metadata: JSON.stringify({
              stripe_session: session.id,
              customer_details: session.customer_details,
              custom_fields: session.custom_fields,
              line_items_count: fullSession.line_items?.data?.length || 0,
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

        // Trigger Discord webhooks for completed order (with error handling)
        try {
          await triggerWebhooks('payment.completed', {
            order_number: order.order_number,
            customer_email: order.customer_email,
            customer_name: order.customer_name || session.customer_details?.name || 'Unknown Customer',
            amount: formatAmountFromStripe(order.amount_cents || 0),
            currency: order.currency || 'USD',
            payment_intent_id: session.payment_intent as string,
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
            customer_name: order.customer_name || session.customer_details?.name || 'Unknown Customer',
            amount: formatAmountFromStripe(order.amount_cents || 0),
            currency: order.currency || 'USD',
            status: 'completed',
            items: fullSession.line_items?.data?.map(item => ({
              name: (item.price?.product as any)?.name || 'Unknown Product',
              quantity: item.quantity || 1,
              price: formatAmountFromStripe(item.amount_total || 0),
            })) || [],
          });
        } catch (webhookError) {
          console.error('⚠️ Discord webhook failed (order still processed):', webhookError);
          // Don't throw error - order was processed successfully
        }

        // Send license delivery email
        try {
          // Get all licenses for this order
          const { data: orderLicenses } = await supabase
            .from('licenses')
            .select('*')
            .eq('order_id', order.id);

          if (orderLicenses && orderLicenses.length > 0) {
            // Import email functions
            const { sendEmail } = await import('@/lib/email');
            const { createLicenseDeliveryEmail } = await import('@/lib/email-templates');

            // Send email with all license keys
            const licenseKeys = orderLicenses
              .filter(license => license.license_key && !license.license_key.startsWith('PENDING-'))
              .map(license => `${license.product_name}: ${license.license_key}`)
              .join('\n');

            if (licenseKeys) {
              const emailHtml = createLicenseDeliveryEmail({
                username: order.customer_name || order.customer_email.split('@')[0],
                orderNumber: order.order_number,
                productName: orderLicenses.length > 1 ? 
                  `${orderLicenses.length} Products` : 
                  orderLicenses[0].product_name || 'Digital Product',
                licenseKey: licenseKeys,
                amount: formatAmountFromStripe(order.amount_cents || 0),
                expiresAt: orderLicenses[0].expires_at,
              });

              await sendEmail({
                to: order.customer_email,
                subject: `🔥 Your Magma License Keys - Order ${order.order_number}`,
                html: emailHtml,
              });

              console.log('✅ License delivery email sent to:', order.customer_email);
            } else {
              console.warn('⚠️ No valid license keys found for email delivery');
            }
          }
        } catch (emailError) {
          console.error('⚠️ Email delivery failed (order still processed):', emailError);
          // Don't throw error - order was processed successfully
        }

        // Track purchase in analytics
        try {
          // Find the session for analytics tracking
          const sessionId = session.metadata?.analytics_session_id;
          if (sessionId) {
            await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/analytics/track`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                sessionId,
                page: '/payment/success',
                activity: 'completed',
                eventType: 'purchase',
                eventData: {
                  orderId: order.order_number,
                  productName: order.product_name,
                  amount: order.amount_cents / 100,
                },
                value: order.amount_cents / 100,
              }),
            });
          }
        } catch (analyticsError) {
          console.error('⚠️ Analytics tracking failed (order still processed):', analyticsError);
        }
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
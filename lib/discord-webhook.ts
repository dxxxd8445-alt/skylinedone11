import { createAdminClient } from '@/lib/supabase/admin';

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
  thumbnail?: {
    url: string;
  };
}

interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

export async function sendDiscordWebhook(webhookUrl: string, payload: DiscordWebhookPayload): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Discord webhook failed:', response.status, response.statusText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Discord webhook error:', error);
    return false;
  }
}

export function createCheckoutStartedEmbed(checkoutData: {
  customer_email: string;
  customer_name?: string;
  session_id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount?: number;
  total: number;
  currency: string;
}): DiscordEmbed {
  const fields = [
    {
      name: '👤 Customer Name',
      value: `\`${checkoutData.customer_name || 'Guest'}\``,
      inline: true,
    },
    {
      name: '📧 Email Address',
      value: `\`${checkoutData.customer_email}\``,
      inline: true,
    },
    {
      name: '💰 Total Amount',
      value: `**$${checkoutData.total.toFixed(2)} ${checkoutData.currency.toUpperCase()}**`,
      inline: true,
    },
  ];

  if (checkoutData.items && checkoutData.items.length > 0) {
    const itemsText = checkoutData.items
      .map(item => `🎮 **${item.name}**\n   └ Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`)
      .join('\n\n');
    
    fields.push({
      name: '🛒 Cart Items',
      value: itemsText.length > 1024 ? itemsText.substring(0, 1021) + '...' : itemsText,
      inline: false,
    });
  }

  if (checkoutData.subtotal) {
    fields.push({
      name: '📊 Subtotal',
      value: `$${checkoutData.subtotal.toFixed(2)}`,
      inline: true,
    });
  }

  if (checkoutData.discount && checkoutData.discount > 0) {
    fields.push({
      name: '🎟️ Discount Applied',
      value: `**-$${checkoutData.discount.toFixed(2)}**`,
      inline: true,
    });
  }

  fields.push({
    name: '🔑 Session ID',
    value: `\`${checkoutData.session_id.substring(0, 30)}...\``,
    inline: false,
  });

  return {
    title: '🛒 New Checkout Started!',
    description: `🎯 A customer has initiated checkout and is reviewing their order.`,
    color: 0x3b82f6, // Skyline Blue
    fields,
    footer: {
      text: 'Skyline Cheats • Checkout System',
    },
    timestamp: new Date().toISOString(),
  };
}

export function createNewOrderEmbed(orderData: {
  order_number: string;
  customer_email: string;
  customer_name: string;
  amount: number;
  currency: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}): DiscordEmbed {
  const fields = [
    {
      name: '🎉 Order Number',
      value: `\`${orderData.order_number}\``,
      inline: false,
    },
    {
      name: '💵 Payment Amount',
      value: `**$${orderData.amount.toFixed(2)} ${orderData.currency.toUpperCase()}**`,
      inline: true,
    },
    {
      name: '👤 Customer',
      value: `\`${orderData.customer_name || 'Guest'}\``,
      inline: true,
    },
    {
      name: '📧 Email',
      value: `\`${orderData.customer_email}\``,
      inline: true,
    },
  ];

  if (orderData.items && orderData.items.length > 0) {
    const itemsText = orderData.items
      .map(item => `✅ **${item.name}**\n   └ Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`)
      .join('\n\n');
    
    fields.push({
      name: '📦 Purchased Items',
      value: itemsText.length > 1024 ? itemsText.substring(0, 1021) + '...' : itemsText,
      inline: false,
    });
  }

  fields.push({
    name: '✨ Status',
    value: '**COMPLETED** - Payment processed successfully!',
    inline: false,
  });

  return {
    title: '✅ Order Completed Successfully!',
    description: `🎊 **Ka-ching!** A new order has been successfully processed and payment confirmed.`,
    color: 0x10b981, // Green for success
    fields,
    footer: {
      text: 'Skyline Cheats • Order System',
    },
    timestamp: new Date().toISOString(),
  };
}

export function createPendingOrderEmbed(orderData: {
  order_number: string;
  customer_email: string;
  customer_name?: string;
  amount: number;
  currency: string;
  payment_method?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}): DiscordEmbed {
  const fields = [
    {
      name: '🔖 Order Number',
      value: `\`${orderData.order_number}\``,
      inline: false,
    },
    {
      name: '💳 Payment Amount',
      value: `**$${orderData.amount.toFixed(2)} ${orderData.currency.toUpperCase()}**`,
      inline: true,
    },
    {
      name: '👤 Customer',
      value: `\`${orderData.customer_name || orderData.customer_email}\``,
      inline: true,
    },
    {
      name: '💰 Payment Method',
      value: `${orderData.payment_method || 'Stripe'}`,
      inline: true,
    },
    {
      name: '📧 Email',
      value: `\`${orderData.customer_email}\``,
      inline: false,
    },
  ];

  if (orderData.items && orderData.items.length > 0) {
    const itemsText = orderData.items
      .map(item => `⏳ **${item.name}**\n   └ Qty: ${item.quantity} × $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`)
      .join('\n\n');
    
    fields.push({
      name: '📦 Order Items',
      value: itemsText.length > 1024 ? itemsText.substring(0, 1021) + '...' : itemsText,
      inline: false,
    });
  }

  fields.push({
    name: '⏰ Status',
    value: '**PENDING** - Awaiting payment confirmation...',
    inline: false,
  });

  return {
    title: '⏳ Order Pending Payment',
    description: `💳 A new order has been created and is awaiting payment confirmation from Stripe.`,
    color: 0xf59e0b, // Orange/Amber for pending
    fields,
    footer: {
      text: 'Skyline Cheats • Order System',
    },
    timestamp: new Date().toISOString(),
  };
}

export function createPaymentFailedEmbed(paymentData: {
  payment_intent_id?: string;
  order_number?: string;
  customer_email?: string;
  customer_name?: string;
  amount?: number;
  currency?: string;
  error_message?: string;
}): DiscordEmbed {
  const fields = [];

  if (paymentData.order_number) {
    fields.push({
      name: '🔖 Order Number',
      value: `\`${paymentData.order_number}\``,
      inline: false,
    });
  }

  if (paymentData.payment_intent_id) {
    fields.push({
      name: '🔑 Payment Intent ID',
      value: `\`${paymentData.payment_intent_id}\``,
      inline: false,
    });
  }

  if (paymentData.customer_name) {
    fields.push({
      name: '👤 Customer Name',
      value: `\`${paymentData.customer_name}\``,
      inline: true,
    });
  }

  if (paymentData.customer_email) {
    fields.push({
      name: '📧 Customer Email',
      value: `\`${paymentData.customer_email}\``,
      inline: true,
    });
  }

  if (paymentData.amount && paymentData.currency) {
    fields.push({
      name: '💸 Failed Amount',
      value: `**$${paymentData.amount.toFixed(2)} ${paymentData.currency.toUpperCase()}**`,
      inline: true,
    });
  }

  if (paymentData.error_message) {
    fields.push({
      name: '⚠️ Error Details',
      value: `\`\`\`${paymentData.error_message.length > 1000 
        ? paymentData.error_message.substring(0, 997) + '...' 
        : paymentData.error_message}\`\`\``,
      inline: false,
    });
  }

  fields.push({
    name: '❌ Status',
    value: '**FAILED** - Payment could not be processed',
    inline: false,
  });

  return {
    title: '❌ Payment Failed',
    description: `⚠️ A payment attempt has failed. Customer may retry or contact support.`,
    color: 0xef4444, // Red for failed
    fields,
    footer: {
      text: 'Skyline Cheats • Payment System',
    },
    timestamp: new Date().toISOString(),
  };
}

export function createRefundEmbed(refundData: {
  order_number: string;
  customer_email: string;
  customer_name?: string;
  amount: number;
  currency: string;
  reason?: string;
}): DiscordEmbed {
  const fields = [
    {
      name: '🔖 Order Number',
      value: `\`${refundData.order_number}\``,
      inline: false,
    },
    {
      name: '💸 Refund Amount',
      value: `**$${refundData.amount.toFixed(2)} ${refundData.currency.toUpperCase()}**`,
      inline: true,
    },
    {
      name: '👤 Customer',
      value: `\`${refundData.customer_name || 'Guest'}\``,
      inline: true,
    },
    {
      name: '📧 Email',
      value: `\`${refundData.customer_email}\``,
      inline: true,
    },
  ];

  if (refundData.reason) {
    fields.push({
      name: '📝 Refund Reason',
      value: refundData.reason.length > 1024 
        ? refundData.reason.substring(0, 1021) + '...' 
        : refundData.reason,
      inline: false,
    });
  } else {
    fields.push({
      name: '📝 Refund Reason',
      value: 'No reason provided',
      inline: false,
    });
  }

  fields.push({
    name: '🔄 Status',
    value: '**REFUNDED** - Funds returned to customer',
    inline: false,
  });

  return {
    title: '🔄 Order Refunded',
    description: `💰 A refund has been processed and funds are being returned to the customer.`,
    color: 0x8b5cf6, // Purple for refund
    fields,
    footer: {
      text: 'Skyline Cheats • Refund System',
    },
    timestamp: new Date().toISOString(),
  };
}

export async function triggerWebhooks(eventType: string, eventData: any) {
  try {
    const supabase = createAdminClient();

    // Get all active webhooks that listen to this event
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('is_active', true)
      .contains('events', [eventType]);

    if (!webhooks || webhooks.length === 0) {
      console.log(`No active webhooks found for event: ${eventType}`);
      return;
    }

    console.log(`🔔 Triggering ${webhooks.length} webhooks for event: ${eventType}`);

    // Send webhook to each registered URL
    for (const webhook of webhooks) {
      try {
        let payload: DiscordWebhookPayload;

        // Check if this is a Discord webhook URL
        const isDiscordWebhook = webhook.url.includes('discord.com/api/webhooks/');

        if (isDiscordWebhook) {
          // Create Discord-specific payload based on event type
          let embed: DiscordEmbed;
          
          switch (eventType) {
            case 'checkout.started':
              embed = createCheckoutStartedEmbed(eventData);
              break;
            case 'order.pending':
              embed = createPendingOrderEmbed(eventData);
              break;
            case 'payment.completed':
            case 'order.completed':
              embed = createNewOrderEmbed(eventData);
              break;
            case 'payment.failed':
              embed = createPaymentFailedEmbed(eventData);
              break;
            case 'order.refunded':
              embed = createRefundEmbed(eventData);
              break;
            default:
              // Generic Discord message for other events
              payload = {
                content: `**${eventType.toUpperCase()}**\n\`\`\`json\n${JSON.stringify(eventData, null, 2)}\`\`\``,
                username: 'Skyline Cheats',
              };
              break;
          }

          if (embed!) {
            payload = {
              embeds: [embed],
              username: 'Skyline Cheats',
            };
          }
        } else {
          // Generic webhook payload for non-Discord webhooks
          payload = {
            event: eventType,
            data: eventData,
            timestamp: new Date().toISOString(),
          } as any;
        }

        const success = await sendDiscordWebhook(webhook.url, payload);
        
        if (success) {
          console.log(`✅ Webhook sent successfully to ${webhook.name} (${eventType})`);
        } else {
          console.error(`❌ Failed to send webhook to ${webhook.name} (${eventType})`);
        }
      } catch (error) {
        console.error(`⚠️ Error sending webhook to ${webhook.name}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error triggering webhooks:', error);
  }
}

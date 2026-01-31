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
      name: '💰 Amount',
      value: `$${orderData.amount.toFixed(2)} ${orderData.currency}`,
      inline: true,
    },
    {
      name: '👤 Customer',
      value: orderData.customer_name || 'Unknown',
      inline: true,
    },
    {
      name: '📧 Email',
      value: orderData.customer_email,
      inline: true,
    },
    {
      name: '🔢 Order ID',
      value: orderData.order_number,
      inline: false,
    },
  ];

  if (orderData.items && orderData.items.length > 0) {
    const itemsText = orderData.items
      .map(item => `• ${item.name} (x${item.quantity}) - $${item.price.toFixed(2)}`)
      .join('\n');
    
    fields.push({
      name: '🛒 Items',
      value: itemsText.length > 1024 ? itemsText.substring(0, 1021) + '...' : itemsText,
      inline: false,
    });
  }

  return {
    title: '🎉 New Order Received!',
    description: `A new order has been successfully processed through Stripe.`,
    color: 0x00ff00, // Green color
    fields,
    footer: {
      text: 'Magma Cheats • Order System',
      icon_url: 'https://your-domain.com/icon.png', // Replace with your actual icon URL
    },
    timestamp: new Date().toISOString(),
    thumbnail: {
      url: 'https://your-domain.com/magma-logo.png', // Replace with your actual logo URL
    },
  };
}

export function createPaymentFailedEmbed(paymentData: {
  payment_intent_id: string;
  customer_email?: string;
  amount?: number;
  currency?: string;
  error_message?: string;
}): DiscordEmbed {
  const fields = [
    {
      name: '🔢 Payment Intent',
      value: paymentData.payment_intent_id,
      inline: false,
    },
  ];

  if (paymentData.customer_email) {
    fields.push({
      name: '📧 Customer Email',
      value: paymentData.customer_email,
      inline: true,
    });
  }

  if (paymentData.amount && paymentData.currency) {
    fields.push({
      name: '💰 Amount',
      value: `$${paymentData.amount.toFixed(2)} ${paymentData.currency}`,
      inline: true,
    });
  }

  if (paymentData.error_message) {
    fields.push({
      name: '❌ Error',
      value: paymentData.error_message.length > 1024 
        ? paymentData.error_message.substring(0, 1021) + '...' 
        : paymentData.error_message,
      inline: false,
    });
  }

  return {
    title: '❌ Payment Failed',
    description: 'A payment attempt has failed.',
    color: 0xff0000, // Red color
    fields,
    footer: {
      text: 'Magma Cheats • Payment System',
      icon_url: 'https://your-domain.com/icon.png', // Replace with your actual icon URL
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

    // Send webhook to each registered URL
    for (const webhook of webhooks) {
      try {
        let payload: DiscordWebhookPayload;

        // Check if this is a Discord webhook URL
        const isDiscordWebhook = webhook.url.includes('discord.com/api/webhooks/');

        if (isDiscordWebhook) {
          // Create Discord-specific payload
          if (eventType === 'payment.completed' || eventType === 'order.completed') {
            const embed = createNewOrderEmbed(eventData);
            payload = {
              embeds: [embed],
              username: 'Magma Cheats',
              avatar_url: 'https://your-domain.com/magma-logo.png', // Replace with your actual logo URL
            };
          } else if (eventType === 'payment.failed') {
            const embed = createPaymentFailedEmbed(eventData);
            payload = {
              embeds: [embed],
              username: 'Magma Cheats',
              avatar_url: 'https://your-domain.com/magma-logo.png', // Replace with your actual logo URL
            };
          } else {
            // Generic Discord message for other events
            payload = {
              content: `**${eventType.toUpperCase()}**\n\`\`\`json\n${JSON.stringify(eventData, null, 2)}\`\`\``,
              username: 'Magma Cheats',
              avatar_url: 'https://your-domain.com/magma-logo.png', // Replace with your actual logo URL
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
          console.log(`Webhook sent successfully to ${webhook.name} (${webhook.url})`);
        } else {
          console.error(`Failed to send webhook to ${webhook.name} (${webhook.url})`);
        }
      } catch (error) {
        console.error(`Error sending webhook to ${webhook.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error triggering webhooks:', error);
  }
}
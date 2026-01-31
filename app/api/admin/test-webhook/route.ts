import { NextRequest, NextResponse } from 'next/server';
import { triggerWebhooks } from '@/lib/discord-webhook';
import { requirePermission } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    await requirePermission('manage_webhooks');

    const { eventType, testData } = await request.json();

    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      );
    }

    // Create test data based on event type
    let webhookData;
    
    switch (eventType) {
      case 'payment.completed':
      case 'order.completed':
        webhookData = testData || {
          order_number: `TEST-${Date.now()}`,
          customer_email: 'test@example.com',
          customer_name: 'Test Customer',
          amount: 29.99,
          currency: 'USD',
          payment_intent_id: `pi_test_${Date.now()}`,
          stripe_session_id: `cs_test_${Date.now()}`,
          items: [
            {
              name: 'Test Product',
              quantity: 1,
              price: 29.99,
            },
          ],
        };
        break;
        
      case 'payment.failed':
        webhookData = testData || {
          payment_intent_id: `pi_test_failed_${Date.now()}`,
          customer_email: 'test@example.com',
          amount: 29.99,
          currency: 'USD',
          error_message: 'Test payment failure - insufficient funds',
        };
        break;
        
      case 'license.created':
        webhookData = testData || {
          license_key: `TEST-${Date.now()}-ABCD`,
          product_name: 'Test Product',
          customer_email: 'test@example.com',
          status: 'active',
        };
        break;
        
      case 'license.revoked':
        webhookData = testData || {
          license_key: `TEST-${Date.now()}-REVOKED`,
          product_name: 'Test Product',
          customer_email: 'test@example.com',
          reason: 'Test revocation',
        };
        break;
        
      default:
        webhookData = testData || {
          message: 'This is a test webhook',
          timestamp: new Date().toISOString(),
        };
    }

    // Trigger the webhooks
    await triggerWebhooks(eventType, webhookData);

    return NextResponse.json({
      success: true,
      message: `Test webhook sent for event: ${eventType}`,
      data: webhookData,
    });

  } catch (error: any) {
    console.error('Test webhook error:', error);
    
    if (error?.message === 'Unauthorized' || /Forbidden|insufficient permissions/i.test(error?.message ?? '')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send test webhook' },
      { status: 500 }
    );
  }
}
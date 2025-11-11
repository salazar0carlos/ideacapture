import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

// Initialize Supabase client with service role for webhook handling
// Webhooks need service role because they don't have user auth context
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 *
 * Important events handled:
 * - checkout.session.completed: Activate subscription after successful payment
 * - customer.subscription.updated: Update subscription status changes
 * - customer.subscription.deleted: Downgrade to free when subscription ends
 * - invoice.payment_failed: Mark subscription as past_due
 *
 * To test webhooks locally, use Stripe CLI:
 * 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 * 2. Login: stripe login
 * 3. Forward webhooks: stripe listen --forward-to localhost:3000/api/stripe/webhook
 * 4. Copy the webhook signing secret to .env.local as STRIPE_WEBHOOK_SECRET
 * 5. Trigger test events: stripe trigger checkout.session.completed
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found in request');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Log webhook event for debugging
    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        // Payment successful - activate subscription
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        // Subscription updated (plan change, status change, etc.)
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        // Subscription canceled or expired - downgrade to free
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        // Payment failed - mark subscription as past_due
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'invoice.payment_succeeded': {
        // Payment succeeded - ensure subscription is active
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      default:
        // Log unhandled event types for debugging
        console.log(`Unhandled webhook event type: ${event.type}`);
    }

    // Return success response
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * Activates Pro subscription after successful payment
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.supabase_user_id;
    const subscriptionId = session.subscription as string;

    if (!userId) {
      console.error('No user ID in checkout session metadata');
      return;
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

    // Calculate subscription end date
    const endDate = new Date((subscription as any).current_period_end * 1000).toISOString();

    // Update user_settings with subscription info
    const { error } = await (supabase as any)
      .from('user_settings')
      .upsert({
        user_id: userId,
        subscription_tier: 'pro',
        subscription_status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscriptionId,
        subscription_end_date: endDate,
      });

    if (error) {
      console.error('Error updating user settings after checkout:', error);
    } else {
      console.log(`✅ Subscription activated for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

/**
 * Handle customer.subscription.updated event
 * Updates subscription status and details
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.supabase_user_id;

    if (!userId) {
      console.error('No user ID in subscription metadata');
      return;
    }

    // Map Stripe status to our status
    const status = mapStripeStatus((subscription as any).status);

    // Calculate subscription end date
    const endDate = new Date((subscription as any).current_period_end * 1000).toISOString();

    // Determine tier based on subscription status
    // If subscription is canceled/past_due but still in period, keep pro
    // If subscription is expired, downgrade to free
    const tier = ['active', 'trialing'].includes(status) ? 'pro' : 'free';

    // Update user_settings
    const { error } = await (supabase as any)
      .from('user_settings')
      .update({
        subscription_tier: tier,
        subscription_status: status,
        subscription_end_date: endDate,
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating subscription:', error);
    } else {
      console.log(`✅ Subscription updated for user ${userId}: ${status}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

/**
 * Handle customer.subscription.deleted event
 * Downgrades user to free plan
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.supabase_user_id;

    if (!userId) {
      console.error('No user ID in subscription metadata');
      return;
    }

    // Downgrade to free plan
    const { error } = await (supabase as any)
      .from('user_settings')
      .update({
        subscription_tier: 'free',
        subscription_status: 'canceled',
        subscription_end_date: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error downgrading to free plan:', error);
    } else {
      console.log(`✅ User ${userId} downgraded to free plan`);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

/**
 * Handle invoice.payment_failed event
 * Marks subscription as past_due
 */
async function handlePaymentFailed(invoice: any) {
  try {
    if (!invoice.subscription) {
      return;
    }

    // Get subscription to get user ID
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    ) as any;

    const userId = subscription.metadata?.supabase_user_id;

    if (!userId) {
      console.error('No user ID in subscription metadata');
      return;
    }

    // Update status to past_due
    const { error } = await (supabase as any)
      .from('user_settings')
      .update({
        subscription_status: 'past_due',
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error marking subscription as past_due:', error);
    } else {
      console.log(`⚠️ Payment failed for user ${userId}, marked as past_due`);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

/**
 * Handle invoice.payment_succeeded event
 * Ensures subscription is marked as active
 */
async function handlePaymentSucceeded(invoice: any) {
  try {
    if (!invoice.subscription) {
      return;
    }

    // Get subscription to get user ID
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    ) as any;

    const userId = subscription.metadata?.supabase_user_id;

    if (!userId) {
      console.error('No user ID in subscription metadata');
      return;
    }

    // Update status to active if it was past_due
    const { error } = await (supabase as any)
      .from('user_settings')
      .update({
        subscription_status: 'active',
        subscription_tier: 'pro',
      })
      .eq('user_id', userId)
      .eq('subscription_status', 'past_due');

    if (error) {
      console.error('Error updating subscription after payment:', error);
    } else {
      console.log(`✅ Payment succeeded for user ${userId}`);
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

/**
 * Map Stripe subscription status to our status type
 */
function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): string {
  const statusMap: Record<string, string> = {
    'active': 'active',
    'trialing': 'trialing',
    'canceled': 'canceled',
    'incomplete': 'incomplete',
    'incomplete_expired': 'incomplete_expired',
    'past_due': 'past_due',
    'unpaid': 'unpaid',
    'paused': 'canceled', // Treat paused as canceled
  };

  return statusMap[stripeStatus] || 'canceled';
}

// Disable body parsing for webhooks (we need raw body for signature verification)
export const runtime = 'nodejs';
export const preferredRegion = 'auto';

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
} from '@/lib/api-helpers';
import { Database } from '@/lib/database.types';

// Lazy initialize Stripe to avoid build-time errors
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
  });
}

/**
 * POST /api/stripe/create-checkout-session
 * Creates a Stripe checkout session for Pro plan subscription
 *
 * Request body:
 * - billing_period: "monthly" | "yearly"
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { user, error: authError } = await getAuthenticatedUser(request);
    if (authError || !user) {
      return NextResponse.json(
        formatApiResponse(null, authError || 'Unauthorized'),
        { status: 401, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        formatApiResponse(null, 'Invalid JSON in request body'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    const { billing_period } = body;

    // Validate billing period
    if (!billing_period || !['monthly', 'yearly'].includes(billing_period)) {
      return NextResponse.json(
        formatApiResponse(null, 'billing_period must be "monthly" or "yearly"'),
        { status: 400, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Get price ID from environment variables
    const priceId = billing_period === 'monthly'
      ? process.env.STRIPE_PRICE_ID_MONTHLY
      : process.env.STRIPE_PRICE_ID_YEARLY;

    if (!priceId) {
      console.error(`Missing Stripe price ID for ${billing_period} billing`);
      return NextResponse.json(
        formatApiResponse(null, 'Subscription pricing not configured'),
        { status: 500, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient(request);

    // Check if user already has a Stripe customer ID
    const { data: userSettings } = (await supabase
      .from('user_settings')
      .select('stripe_customer_id, subscription_tier')
      .eq('user_id', user.id)
      .single()) as { data: Database['public']['Tables']['user_settings']['Row'] | null; error: any };

    let customerId = userSettings?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const stripe = getStripeClient();
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to database
      await (supabase as any)
        .from('user_settings')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
        });
    }

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create checkout session
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/settings?subscription=success`,
      cancel_url: `${origin}/subscribe?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
        billing_period,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      allow_promotion_codes: true,
    });

    // Return checkout URL
    return NextResponse.json(
      formatApiResponse({ url: session.url }, null),
      { status: 200, headers: addCorsHeaders(new Headers()) }
    );
  } catch (error: any) {
    console.error('Stripe checkout session error:', error);
    return NextResponse.json(
      formatApiResponse(null, error.message || 'Failed to create checkout session'),
      { status: 500, headers: addCorsHeaders(new Headers()) }
    );
  }
}

// OPTIONS - Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: addCorsHeaders(new Headers()),
  });
}

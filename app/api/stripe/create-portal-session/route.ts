import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  createServerSupabaseClient,
  getAuthenticatedUser,
  formatApiResponse,
  addCorsHeaders,
} from '@/lib/api-helpers';
import { Database } from '@/lib/database.types';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * POST /api/stripe/create-portal-session
 * Creates a Stripe customer portal session for managing subscriptions
 *
 * The customer portal allows users to:
 * - Update payment methods
 * - View billing history and invoices
 * - Cancel or update their subscription
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

    // Create Supabase client
    const supabase = createServerSupabaseClient(request);

    // Get user's Stripe customer ID
    const { data: userSettings } = (await supabase
      .from('user_settings')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()) as { data: Database['public']['Tables']['user_settings']['Row'] | null; error: any };

    const customerId = userSettings?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json(
        formatApiResponse(null, 'No Stripe customer found. Please subscribe first.'),
        { status: 404, headers: addCorsHeaders(new Headers()) }
      );
    }

    // Get the origin for return URL
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings`,
    });

    // Return portal URL
    return NextResponse.json(
      formatApiResponse({ url: session.url }, null),
      { status: 200, headers: addCorsHeaders(new Headers()) }
    );
  } catch (error: any) {
    console.error('Stripe portal session error:', error);
    return NextResponse.json(
      formatApiResponse(null, error.message || 'Failed to create portal session'),
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

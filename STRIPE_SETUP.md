# Stripe Subscription Setup Guide

This guide walks you through setting up the Stripe subscription system for IdeaCapture.

## Overview

IdeaCapture now includes a complete Stripe subscription system with two tiers:
- **Free Plan**: 10 ideas max, 2-min voice recordings, 3 refinement questions, no validation
- **Pro Plan**: $4.99/month or $49.99/year - Unlimited ideas, 5-min recordings, 5 refinement questions, full validation

## Prerequisites

1. A Stripe account (create one at https://stripe.com)
2. Node.js and npm installed
3. Supabase project with the updated schema

## Step 1: Update Database Schema

Run the updated `supabase/schema.sql` in your Supabase SQL Editor. This adds the following fields to `user_settings`:
- `subscription_tier` (free or pro)
- `subscription_status` (active, canceled, past_due, etc.)
- `stripe_customer_id`
- `stripe_subscription_id`
- `subscription_end_date`
- `ideas_count`

## Step 2: Create Stripe Products and Prices

1. Log in to your Stripe Dashboard (https://dashboard.stripe.com)
2. Go to **Products** → **Add Product**

### Create Pro Monthly Product
- Name: "IdeaCapture Pro - Monthly"
- Description: "Unlimited ideas with AI-powered validation and refinement"
- Pricing: $4.99 USD
- Billing Period: Monthly
- Save and copy the **Price ID** (starts with `price_`)

### Create Pro Yearly Product
- Name: "IdeaCapture Pro - Yearly"
- Description: "Unlimited ideas with AI-powered validation and refinement"
- Pricing: $49.99 USD
- Billing Period: Yearly
- Save and copy the **Price ID** (starts with `price_`)

## Step 3: Get API Keys

### Get Secret Key
1. In Stripe Dashboard, go to **Developers** → **API Keys**
2. Copy your **Secret key** (starts with `sk_test_` for test mode or `sk_live_` for production)

### Get Publishable Key
1. Same location as above
2. Copy your **Publishable key** (starts with `pk_test_` for test mode or `pk_live_` for production)

## Step 4: Configure Environment Variables

Create or update your `.env.local` file with the following:

```bash
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Product Price IDs (from Step 2)
STRIPE_PRICE_ID_MONTHLY=price_your_monthly_price_id_here
STRIPE_PRICE_ID_YEARLY=price_your_yearly_price_id_here
```

**Important**: Get the `SUPABASE_SERVICE_ROLE_KEY` from your Supabase project settings under API. This is needed for webhook handling.

## Step 5: Set Up Webhooks

Webhooks allow Stripe to notify your app about subscription events (payments, cancellations, etc.).

### For Local Development (using Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli#install
2. Login to your Stripe account:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add it to your `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Keep this terminal running while developing

### For Production Deployment

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your production URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Add endpoint and copy the **Signing secret** to your production environment variables

## Step 6: Test the Integration

### Test Subscription Flow
1. Start your development server: `npm run dev`
2. Start Stripe CLI webhook forwarding (see Step 5)
3. Navigate to `/subscribe` in your app
4. Click "Subscribe Monthly" or "Subscribe Yearly"
5. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

### Test Webhook Events
Using Stripe CLI, you can trigger test events:
```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

### Verify Database Updates
After a successful subscription:
1. Check Supabase `user_settings` table
2. Verify `subscription_tier` is "pro"
3. Verify `subscription_status` is "active"
4. Verify `stripe_customer_id` and `stripe_subscription_id` are populated

## Step 7: Enable Stripe Customer Portal (Optional but Recommended)

The Customer Portal allows users to manage their own subscriptions, payment methods, and view invoices.

1. In Stripe Dashboard, go to **Settings** → **Billing** → **Customer portal**
2. Click **Activate test link** (for test mode) or configure for production
3. Customize settings:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to update subscriptions
   - ✅ Allow customers to cancel subscriptions
   - ✅ Invoice history
4. Save changes

## Step 8: Switch to Production Mode

When ready to go live:

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Repeat Steps 2-5 with live mode keys
3. Update your production environment variables with live keys
4. Test the complete flow with a real (small amount) payment

## Architecture Overview

### API Routes
- `/api/stripe/create-checkout-session` - Creates Stripe checkout for new subscriptions
- `/api/stripe/create-portal-session` - Opens Stripe customer portal for subscription management
- `/api/stripe/webhook` - Handles Stripe webhook events

### Subscription Checks
- Idea creation checks `ideas_count` limit
- Refinement questions adjusted based on tier (3 for free, 5 for pro)
- Validation blocked for free users

### Components
- `PricingCard` - Reusable pricing display component
- `SubscriptionGuard` - Modal that prompts upgrade when hitting limits
- `/subscribe` - Pricing page with all plans
- `/settings` - Displays current subscription and management options

## Common Issues

### Webhook signature verification failed
- Ensure `STRIPE_WEBHOOK_SECRET` matches the secret from Stripe CLI or webhook endpoint
- Check that you're using the raw request body (already handled in webhook route)

### Subscription not activating after payment
- Check webhook logs in Stripe Dashboard under **Developers** → **Webhooks**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check server logs for errors in webhook handler

### Customer portal not opening
- Ensure customer portal is activated in Stripe Dashboard
- Verify user has a `stripe_customer_id` in database

### Ideas count not updating
- Check that `incrementIdeasCount` is called after successful idea creation
- Verify database has proper permissions for updating `user_settings`

## Security Notes

1. **Never commit API keys** - Always use environment variables
2. **Always verify webhook signatures** - Already implemented in webhook route
3. **Use HTTPS in production** - Required for Stripe webhooks
4. **Store minimal data** - Only store necessary Stripe IDs, not payment details
5. **Service role key** - Only use in server-side code, never expose to client

## Testing Webhooks

Use these Stripe test card numbers for different scenarios:

- **Successful payment**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`
- **Insufficient funds**: `4000 0000 0000 9995`

## Additional Resources

- [Stripe Testing Documentation](https://stripe.com/docs/testing)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Stripe Subscriptions Documentation](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)

## Support

If you encounter issues:
1. Check Stripe Dashboard logs
2. Check your application server logs
3. Verify all environment variables are set correctly
4. Test with Stripe CLI in local development first

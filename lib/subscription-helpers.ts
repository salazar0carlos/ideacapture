import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Subscription tier limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    maxIdeas: 10,
    maxRecordingMinutes: 2,
    maxRefinementQuestions: 3,
    canValidate: false,
  },
  pro: {
    maxIdeas: Infinity,
    maxRecordingMinutes: 5,
    maxRefinementQuestions: 5,
    canValidate: true,
  },
} as const;

export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid';

export interface UserSubscription {
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_end_date: string | null;
  ideas_count: number;
}

export interface SubscriptionLimits {
  can_create_idea: boolean;
  can_use_refinement: boolean;
  can_use_validation: boolean;
  current_ideas_count: number;
  max_ideas: number;
  subscription_tier: SubscriptionTier;
}

/**
 * Get user settings from Supabase
 */
async function getUserSettings(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
): Promise<UserSubscription | null> {
  const { data, error } = await (supabase as any)
    .from('user_settings')
    .select('subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id, subscription_end_date, ideas_count')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user settings:', error);
    return null;
  }

  return data as UserSubscription;
}

/**
 * Check subscription limits for a user
 * Returns whether the user can create ideas, use refinement, and use validation
 */
export async function checkSubscriptionLimits(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
): Promise<SubscriptionLimits> {
  // Get user settings
  const settings = await getUserSettings(supabase, userId);

  // Default to free tier if no settings found
  const tier: SubscriptionTier = settings?.subscription_tier || 'free';
  const ideasCount = settings?.ideas_count || 0;
  const limits = SUBSCRIPTION_LIMITS[tier];

  return {
    can_create_idea: ideasCount < limits.maxIdeas,
    can_use_refinement: true, // Both tiers can use refinement, just different question counts
    can_use_validation: limits.canValidate,
    current_ideas_count: ideasCount,
    max_ideas: limits.maxIdeas === Infinity ? -1 : limits.maxIdeas, // -1 represents unlimited
    subscription_tier: tier,
  };
}

/**
 * Increment the ideas count for a user
 * Should be called after successfully creating an idea
 */
export async function incrementIdeasCount(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First, ensure user_settings exists
    const { data: existing } = await (supabase as any)
      .from('user_settings')
      .select('id, ideas_count')
      .eq('user_id', userId)
      .single();

    if (!existing) {
      // Create user_settings if it doesn't exist
      const { error: insertError } = await (supabase as any)
        .from('user_settings')
        .insert({
          user_id: userId,
          ideas_count: 1,
          subscription_tier: 'free',
          subscription_status: 'active',
        });

      if (insertError) {
        console.error('Error creating user settings:', insertError);
        return { success: false, error: 'Failed to create user settings' };
      }

      return { success: true };
    }

    // Increment ideas_count
    const { error: updateError } = await (supabase as any)
      .from('user_settings')
      .update({
        ideas_count: (existing.ideas_count || 0) + 1,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error incrementing ideas count:', updateError);
      return { success: false, error: 'Failed to increment ideas count' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error incrementing ideas count:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Decrement the ideas count for a user
 * Should be called after successfully deleting an idea
 */
export async function decrementIdeasCount(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: existing } = await (supabase as any)
      .from('user_settings')
      .select('id, ideas_count')
      .eq('user_id', userId)
      .single();

    if (!existing) {
      return { success: false, error: 'User settings not found' };
    }

    // Decrement ideas_count (don't go below 0)
    const newCount = Math.max(0, (existing.ideas_count || 0) - 1);
    const { error: updateError } = await (supabase as any)
      .from('user_settings')
      .update({
        ideas_count: newCount,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error decrementing ideas count:', updateError);
      return { success: false, error: 'Failed to decrement ideas count' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error decrementing ideas count:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Reset ideas count for a user
 * Should be called when all ideas are deleted
 */
export async function resetIdeasCount(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: updateError } = await (supabase as any)
      .from('user_settings')
      .update({
        ideas_count: 0,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error resetting ideas count:', updateError);
      return { success: false, error: 'Failed to reset ideas count' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error resetting ideas count:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * Get subscription status for a user
 * Returns full subscription details
 */
export async function getSubscriptionStatus(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
): Promise<UserSubscription | null> {
  return getUserSettings(supabase, userId);
}

/**
 * Get the maximum number of refinement questions allowed for a user's tier
 */
export async function getMaxRefinementQuestions(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
): Promise<number> {
  const settings = await getUserSettings(supabase, userId);
  const tier: SubscriptionTier = settings?.subscription_tier || 'free';
  return SUBSCRIPTION_LIMITS[tier].maxRefinementQuestions;
}

/**
 * Get the maximum recording duration in minutes for a user's tier
 */
export async function getMaxRecordingMinutes(
  supabase: ReturnType<typeof createClient<Database>>,
  userId: string
): Promise<number> {
  const settings = await getUserSettings(supabase, userId);
  const tier: SubscriptionTier = settings?.subscription_tier || 'free';
  return SUBSCRIPTION_LIMITS[tier].maxRecordingMinutes;
}

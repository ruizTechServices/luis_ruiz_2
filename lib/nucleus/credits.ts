//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\lib\nucleus\credits.ts
// =============================================================================
// NUCLEUS BOT CREDITS SERVICE - luis-ruiz.com
// Credit management: add, deduct, check balance, transaction logging
// =============================================================================

import { SupabaseClient } from '@supabase/supabase-js';
import type { 
  NucleusProfile, 
  CreditTransaction, 
  TransactionType,
  UsageLog 
} from './types';

// -----------------------------------------------------------------------------
// Profile Functions
// -----------------------------------------------------------------------------

/**
 * Get or create a nucleus profile for a user
 */
export async function getOrCreateProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string
): Promise<NucleusProfile> {
  // Try to get existing profile
  const { data: existing, error: fetchError } = await supabase
    .from('nucleus_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (existing) {
    return existing as NucleusProfile;
  }

  // Create new profile if doesn't exist
  if (fetchError?.code === 'PGRST116') { // Row not found
    const { data: created, error: createError } = await supabase
      .from('nucleus_profiles')
      .insert({
        id: userId,
        email: email,
        display_name: email.split('@')[0],
        credit_balance: 0,
        subscription_tier: 'free',
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create profile: ${createError.message}`);
    }

    return created as NucleusProfile;
  }

  throw new Error(`Failed to fetch profile: ${fetchError?.message}`);
}

/**
 * Get profile by user ID
 */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<NucleusProfile | null> {
  const { data, error } = await supabase
    .from('nucleus_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data as NucleusProfile;
}

/**
 * Get profile by Stripe customer ID
 */
export async function getProfileByStripeCustomer(
  supabase: SupabaseClient,
  stripeCustomerId: string
): Promise<NucleusProfile | null> {
  const { data, error } = await supabase
    .from('nucleus_profiles')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch profile by Stripe ID: ${error.message}`);
  }

  return data as NucleusProfile;
}

/**
 * Update profile fields
 */
export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Omit<NucleusProfile, 'id' | 'created_at' | 'updated_at'>>
): Promise<NucleusProfile> {
  const { data, error } = await supabase
    .from('nucleus_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data as NucleusProfile;
}

// -----------------------------------------------------------------------------
// Credit Balance Functions
// -----------------------------------------------------------------------------

/**
 * Get user's credit balance
 */
export async function getCreditBalance(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('nucleus_profiles')
    .select('credit_balance')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to get credit balance: ${error.message}`);
  }

  return data?.credit_balance ?? 0;
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(
  supabase: SupabaseClient,
  userId: string,
  creditsNeeded: number
): Promise<boolean> {
  const balance = await getCreditBalance(supabase, userId);
  return balance >= creditsNeeded;
}

/**
 * Check if user has active Pro subscription
 */
export async function hasActiveSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const profile = await getProfile(supabase, userId);
  if (!profile) return false;

  return (
    profile.subscription_tier === 'pro' &&
    profile.subscription_status === 'active' &&
    (profile.subscription_ends_at === null || 
     new Date(profile.subscription_ends_at) > new Date())
  );
}

// -----------------------------------------------------------------------------
// Credit Modification Functions
// -----------------------------------------------------------------------------

/**
 * Add credits to user's balance (atomic operation)
 */
export async function addCredits(
  supabase: SupabaseClient,
  userId: string,
  credits: number,
  transaction: {
    type: TransactionType;
    description: string;
    amount_cents?: number;
    stripe_payment_intent_id?: string;
    stripe_checkout_session_id?: string;
  }
): Promise<{ newBalance: number; transactionId: string }> {
  // Get current balance
  const currentBalance = await getCreditBalance(supabase, userId);
  const newBalance = currentBalance + credits;

  // Update balance
  const { error: updateError } = await supabase
    .from('nucleus_profiles')
    .update({ credit_balance: newBalance })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Failed to add credits: ${updateError.message}`);
  }

  // Log transaction
  const { data: txData, error: txError } = await supabase
    .from('nucleus_credit_transactions')
    .insert({
      user_id: userId,
      type: transaction.type,
      credits_change: credits,
      balance_after: newBalance,
      amount_cents: transaction.amount_cents ?? null,
      stripe_payment_intent_id: transaction.stripe_payment_intent_id ?? null,
      stripe_checkout_session_id: transaction.stripe_checkout_session_id ?? null,
      description: transaction.description,
    })
    .select('id')
    .single();

  if (txError) {
    console.error('Failed to log credit transaction:', txError);
    // Don't throw - credits were added successfully
  }

  return { newBalance, transactionId: txData?.id ?? '' };
}

/**
 * Deduct credits from user's balance (atomic operation)
 */
export async function deductCredits(
  supabase: SupabaseClient,
  userId: string,
  credits: number,
  modelUsed: string,
  description?: string
): Promise<{ newBalance: number; transactionId: string }> {
  // Get current balance
  const currentBalance = await getCreditBalance(supabase, userId);
  
  if (currentBalance < credits) {
    throw new Error('INSUFFICIENT_CREDITS');
  }

  const newBalance = currentBalance - credits;

  // Update balance
  const { error: updateError } = await supabase
    .from('nucleus_profiles')
    .update({ credit_balance: newBalance })
    .eq('id', userId);

  if (updateError) {
    throw new Error(`Failed to deduct credits: ${updateError.message}`);
  }

  // Log transaction
  const { data: txData, error: txError } = await supabase
    .from('nucleus_credit_transactions')
    .insert({
      user_id: userId,
      type: 'usage' as TransactionType,
      credits_change: -credits, // Negative for deduction
      balance_after: newBalance,
      model_used: modelUsed,
      description: description ?? `Used ${credits} credits for ${modelUsed}`,
    })
    .select('id')
    .single();

  if (txError) {
    console.error('Failed to log credit deduction:', txError);
  }

  return { newBalance, transactionId: txData?.id ?? '' };
}

// -----------------------------------------------------------------------------
// Usage Logging Functions
// -----------------------------------------------------------------------------

/**
 * Log a usage event
 */
export async function logUsage(
  supabase: SupabaseClient,
  usage: {
    user_id: string;
    model_id: string;
    model_name: string;
    provider: string;
    tier: number;
    credits_used: number;
    tokens_input?: number;
    tokens_output?: number;
    tokens_total?: number;
    request_duration_ms?: number;
    conversation_id?: string;
  }
): Promise<string> {
  const { data, error } = await supabase
    .from('nucleus_usage_logs')
    .insert(usage)
    .select('id')
    .single();

  if (error) {
    console.error('Failed to log usage:', error);
    throw new Error(`Failed to log usage: ${error.message}`);
  }

  return data.id;
}

/**
 * Get user's usage history
 */
export async function getUsageHistory(
  supabase: SupabaseClient,
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<UsageLog[]> {
  let query = supabase
    .from('nucleus_usage_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options.startDate) {
    query = query.gte('created_at', options.startDate);
  }
  if (options.endDate) {
    query = query.lte('created_at', options.endDate);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get usage history: ${error.message}`);
  }

  return data as UsageLog[];
}

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
  supabase: SupabaseClient,
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    type?: TransactionType;
  } = {}
): Promise<CreditTransaction[]> {
  let query = supabase
    .from('nucleus_credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options.type) {
    query = query.eq('type', options.type);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get transaction history: ${error.message}`);
  }

  return data as CreditTransaction[];
}

// -----------------------------------------------------------------------------
// Subscription Functions
// -----------------------------------------------------------------------------

/**
 * Activate Pro subscription
 */
export async function activateSubscription(
  supabase: SupabaseClient,
  userId: string,
  stripeCustomerId: string,
  subscriptionEndsAt?: string
): Promise<NucleusProfile> {
  return updateProfile(supabase, userId, {
    subscription_tier: 'pro',
    subscription_status: 'active',
    stripe_customer_id: stripeCustomerId,
    subscription_ends_at: subscriptionEndsAt ?? null,
  });
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  supabase: SupabaseClient,
  userId: string,
  endsAt: string
): Promise<NucleusProfile> {
  return updateProfile(supabase, userId, {
    subscription_status: 'canceled',
    subscription_ends_at: endsAt,
  });
}

/**
 * Expire subscription (downgrade to credits tier)
 */
export async function expireSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<NucleusProfile> {
  return updateProfile(supabase, userId, {
    subscription_tier: 'credits',
    subscription_status: null,
    subscription_ends_at: null,
  });
}

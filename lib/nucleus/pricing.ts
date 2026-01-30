//C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\lib\nucleus\pricing.ts
// =============================================================================
// NUCLEUS BOT PRICING - luis-ruiz.com
// Model pricing tiers and credit costs (fallback if DB unavailable)
// =============================================================================

import { createClient } from '@/lib/clients/supabase/server';
import type { CreditPackage, ModelPricing, SubscriptionPlan } from './types';

// -----------------------------------------------------------------------------
// Default Model Pricing (fallback - DB is source of truth)
// -----------------------------------------------------------------------------

export const DEFAULT_MODEL_PRICING: Record<string, { tier: 1 | 2 | 3; credits: number; name: string; provider: string }> = {
  // Tier 1: Cheap/Fast (1 credit)
  'gpt-3.5-turbo': { tier: 1, credits: 1, name: 'GPT-3.5 Turbo', provider: 'openai' },
  'gpt-4o-mini': { tier: 1, credits: 1, name: 'GPT-4o Mini', provider: 'openai' },
  'claude-3-5-haiku-latest': { tier: 1, credits: 1, name: 'Claude 3.5 Haiku', provider: 'anthropic' },
  'claude-3-haiku-20240307': { tier: 1, credits: 1, name: 'Claude 3 Haiku', provider: 'anthropic' },

  // Tier 2: Mid-tier (3 credits)
  'gpt-4o': { tier: 2, credits: 3, name: 'GPT-4o', provider: 'openai' },
  'gpt-4-turbo': { tier: 2, credits: 3, name: 'GPT-4 Turbo', provider: 'openai' },
  'gpt-4-turbo-preview': { tier: 2, credits: 3, name: 'GPT-4 Turbo Preview', provider: 'openai' },
  'claude-sonnet-4-20250514': { tier: 2, credits: 3, name: 'Claude Sonnet 4', provider: 'anthropic' },
  'claude-3-5-sonnet-latest': { tier: 2, credits: 3, name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  'claude-3-5-sonnet-20241022': { tier: 2, credits: 3, name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
  'claude-3-sonnet-20240229': { tier: 2, credits: 3, name: 'Claude 3 Sonnet', provider: 'anthropic' },

  // Tier 3: Premium (10 credits)
  'gpt-4': { tier: 3, credits: 10, name: 'GPT-4', provider: 'openai' },
  'gpt-4-0613': { tier: 3, credits: 10, name: 'GPT-4', provider: 'openai' },
  'claude-opus-4-20250514': { tier: 3, credits: 10, name: 'Claude Opus 4', provider: 'anthropic' },
  'claude-3-opus-latest': { tier: 3, credits: 10, name: 'Claude 3 Opus', provider: 'anthropic' },
  'claude-3-opus-20240229': { tier: 3, credits: 10, name: 'Claude 3 Opus', provider: 'anthropic' },
};

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Get credits required for a model (from config fallback)
 */
export function getModelCredits(modelId: string): number {
  const pricing = DEFAULT_MODEL_PRICING[modelId];
  if (!pricing) {
    // Unknown model - charge tier 2 by default
    console.warn(`Unknown model ${modelId}, defaulting to tier 2 pricing`);
    return 3;
  }
  return pricing.credits;
}

/**
 * Get model tier (1, 2, or 3)
 */
export function getModelTier(modelId: string): 1 | 2 | 3 {
  const pricing = DEFAULT_MODEL_PRICING[modelId];
  return pricing?.tier ?? 2;
}

/**
 * Get model info
 */
export function getModelInfo(modelId: string): { name: string; provider: string; tier: number; credits: number } | null {
  const pricing = DEFAULT_MODEL_PRICING[modelId];
  if (!pricing) return null;
  return {
    name: pricing.name,
    provider: pricing.provider,
    tier: pricing.tier,
    credits: pricing.credits,
  };
}

/**
 * Check if a model is supported
 */
export function isModelSupported(modelId: string): boolean {
  return modelId in DEFAULT_MODEL_PRICING;
}

/**
 * Get all supported models grouped by tier
 */
export function getModelsByTier(): Record<1 | 2 | 3, string[]> {
  const result: Record<1 | 2 | 3, string[]> = { 1: [], 2: [], 3: [] };
  
  for (const [modelId, pricing] of Object.entries(DEFAULT_MODEL_PRICING)) {
    result[pricing.tier].push(modelId);
  }
  
  return result;
}

/**
 * Convert DB model pricing to lookup map
 */
export function buildPricingMap(dbPricing: ModelPricing[]): Map<string, ModelPricing> {
  const map = new Map<string, ModelPricing>();
  for (const pricing of dbPricing) {
    map.set(pricing.model_id, pricing);
  }
  return map;
}

// -----------------------------------------------------------------------------
// Credit Package Defaults (fallback - DB is source of truth)
// -----------------------------------------------------------------------------

export const DEFAULT_CREDIT_PACKAGES = [
  { name: 'Starter', credits: 100, price_cents: 500, badge: null },
  { name: 'Standard', credits: 500, price_cents: 2000, badge: 'Popular' },
  { name: 'Power Pack', credits: 1500, price_cents: 5000, badge: 'Best Value' },
];

// -----------------------------------------------------------------------------
// Subscription Defaults
// -----------------------------------------------------------------------------

export const PRO_SUBSCRIPTION = {
  name: 'Nucleus Pro',
  price_cents: 30000, // $300/month
  billing_period: 'monthly' as const,
  monthly_credits: null, // unlimited
  features: [
    'Unlimited requests',
    'All models included',
    'Priority support',
    'Usage analytics',
    'Early access to new features',
  ],
};

export async function getAllModelPricing(): Promise<ModelPricing[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('nucleus_model_pricing')
      .select('*')
      .eq('is_active', true)
      .order('tier', { ascending: true })
      .order('model_name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      return data as ModelPricing[];
    }
  } catch {
    // Fall back below
  }

  return Object.entries(DEFAULT_MODEL_PRICING).map(([modelId, pricing]) => ({
    id: modelId,
    model_id: modelId,
    model_name: pricing.name,
    provider: pricing.provider,
    tier: pricing.tier,
    credits_per_request: pricing.credits,
    is_active: true,
  }));
}

export async function getCreditPackages(): Promise<CreditPackage[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('nucleus_credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      return data as CreditPackage[];
    }
  } catch {
    // Fall back below
  }

  return DEFAULT_CREDIT_PACKAGES.map((p, idx) => ({
    id: p.name.toLowerCase().replace(/\s+/g, '-'),
    name: p.name,
    description: null,
    credits: p.credits,
    price_cents: p.price_cents,
    stripe_price_id: null,
    badge: p.badge,
    sort_order: idx,
    is_active: true,
  }));
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('nucleus_subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    if (data && data.length > 0) {
      return data as SubscriptionPlan[];
    }
  } catch {
    // Fall back below
  }

  return [
    {
      id: 'pro',
      name: PRO_SUBSCRIPTION.name,
      tier: 'pro',
      description: null,
      price_cents: PRO_SUBSCRIPTION.price_cents,
      billing_period: PRO_SUBSCRIPTION.billing_period,
      monthly_credits: PRO_SUBSCRIPTION.monthly_credits,
      features: PRO_SUBSCRIPTION.features,
      stripe_price_id: null,
      stripe_product_id: null,
      is_active: true,
    },
  ];
}

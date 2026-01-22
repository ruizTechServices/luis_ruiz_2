// =============================================================================
// NUCLEUS BOT TYPES - luis-ruiz.com
// TypeScript interfaces for Nucleus Bot API
// =============================================================================

// -----------------------------------------------------------------------------
// Profile & Subscription Types
// -----------------------------------------------------------------------------

export type SubscriptionTier = 'free' | 'credits' | 'pro';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | null;
export type TransactionType = 'purchase' | 'usage' | 'refund' | 'subscription_grant' | 'admin_adjustment' | 'bonus';

export interface NucleusProfile {
  id: string;
  email: string;
  display_name: string | null;
  credit_balance: number;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  subscription_ends_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

// -----------------------------------------------------------------------------
// Credit & Transaction Types
// -----------------------------------------------------------------------------

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  credits_change: number;
  balance_after: number;
  amount_cents: number | null;
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  model_used: string | null;
  description: string;
  created_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price_cents: number;
  stripe_price_id: string | null;
  badge: string | null;
  sort_order: number;
  is_active: boolean;
}

// -----------------------------------------------------------------------------
// Model & Pricing Types
// -----------------------------------------------------------------------------

export interface ModelPricing {
  id: string;
  model_id: string;
  model_name: string;
  provider: string;
  tier: 1 | 2 | 3;
  credits_per_request: number;
  is_active: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: 'pro';
  description: string | null;
  price_cents: number;
  billing_period: 'monthly' | 'yearly';
  monthly_credits: number | null; // null = unlimited
  features: string[];
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  is_active: boolean;
}

// -----------------------------------------------------------------------------
// Usage Types
// -----------------------------------------------------------------------------

export interface UsageLog {
  id: string;
  user_id: string;
  model_id: string;
  model_name: string;
  provider: string;
  tier: number;
  credits_used: number;
  tokens_input: number | null;
  tokens_output: number | null;
  tokens_total: number | null;
  request_duration_ms: number | null;
  conversation_id: string | null;
  created_at: string;
}

export interface UsageSummary {
  total_requests: number;
  total_credits_used: number;
  total_tokens: number;
  by_model: {
    model_id: string;
    model_name: string;
    requests: number;
    credits: number;
  }[];
  by_day: {
    date: string;
    requests: number;
    credits: number;
  }[];
}

// -----------------------------------------------------------------------------
// API Request/Response Types
// -----------------------------------------------------------------------------

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  conversation_id?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  response: string;
  model: string;
  credits_used: number;
  credits_remaining: number;
  tokens_input?: number;
  tokens_output?: number;
  finish_reason?: string;
}

export interface PurchaseRequest {
  package_id: string;
  success_url?: string;
  cancel_url?: string;
}

export interface PurchaseResponse {
  checkout_url: string;
  session_id: string;
}

export interface SubscriptionCreateRequest {
  plan_id?: string; // defaults to 'pro'
  success_url?: string;
  cancel_url?: string;
}

export interface SubscriptionCreateResponse {
  checkout_url: string;
  session_id: string;
}

// -----------------------------------------------------------------------------
// Error Types
// -----------------------------------------------------------------------------

export interface APIError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface InsufficientCreditsError extends APIError {
  code: 'INSUFFICIENT_CREDITS';
  details: {
    credits_needed: number;
    credits_available: number;
    model: string;
  };
}

// -----------------------------------------------------------------------------
// Stripe Webhook Types
// -----------------------------------------------------------------------------

export interface StripeWebhookMetadata {
  user_id: string;
  package_id?: string;
  credits?: string;
}

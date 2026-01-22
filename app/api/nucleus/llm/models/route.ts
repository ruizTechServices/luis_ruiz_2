// =============================================================================
// NUCLEUS BOT API - /api/nucleus/llm/models
// Get available models with pricing information
// =============================================================================

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { successResponse, errorResponse } from '@/lib/nucleus/auth';
import type { ModelPricing } from '@/lib/nucleus/types';

/**
 * GET /api/nucleus/llm/models
 * Get all active models with pricing
 * No authentication required - public endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: models, error } = await supabase
      .from('nucleus_model_pricing')
      .select('*')
      .eq('is_active', true)
      .order('tier', { ascending: true })
      .order('provider', { ascending: true });

    if (error) {
      console.error('Failed to fetch models:', error);
      return errorResponse('Failed to fetch models', 'FETCH_ERROR', 500);
    }

    // Group by tier
    const modelsByTier: Record<number, ModelPricing[]> = {
      1: [],
      2: [],
      3: [],
    };

    for (const model of models as ModelPricing[]) {
      if (modelsByTier[model.tier]) {
        modelsByTier[model.tier].push(model);
      }
    }

    // Format for client
    const formattedModels = (models as ModelPricing[]).map(model => ({
      id: model.model_id,
      name: model.model_name,
      provider: model.provider,
      tier: model.tier,
      credits_per_request: model.credits_per_request,
      tier_label: model.tier === 1 ? 'Fast' : model.tier === 2 ? 'Balanced' : 'Premium',
    }));

    return successResponse({
      models: formattedModels,
      by_tier: {
        fast: modelsByTier[1].map(m => ({
          id: m.model_id,
          name: m.model_name,
          provider: m.provider,
          credits: m.credits_per_request,
        })),
        balanced: modelsByTier[2].map(m => ({
          id: m.model_id,
          name: m.model_name,
          provider: m.provider,
          credits: m.credits_per_request,
        })),
        premium: modelsByTier[3].map(m => ({
          id: m.model_id,
          name: m.model_name,
          provider: m.provider,
          credits: m.credits_per_request,
        })),
      },
      pricing_tiers: {
        1: { label: 'Fast', credits: 1, description: 'Quick responses, lower cost' },
        2: { label: 'Balanced', credits: 3, description: 'Great balance of speed and quality' },
        3: { label: 'Premium', credits: 10, description: 'Best quality, most capable' },
      },
    });
  } catch (err) {
    console.error('Models error:', err);
    return errorResponse('Failed to get models', 'MODELS_ERROR', 500);
  }
}

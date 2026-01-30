// =============================================================================
// GET /api/nucleus/models
// Get available models and their pricing
// =============================================================================

import { NextResponse } from 'next/server';
import { getAllModelPricing } from '@/lib/nucleus/pricing';

export async function GET() {
  try {
    const models = await getAllModelPricing();
    
    // Group by provider
    const byProvider: Record<string, typeof models> = {};
    
    for (const model of models) {
      if (!byProvider[model.provider]) {
        byProvider[model.provider] = [];
      }
      byProvider[model.provider].push(model);
    }
    
    // Format for response
    const formattedModels = models.map(m => ({
      id: m.model_id,
      name: m.model_name,
      provider: m.provider,
      tier: m.tier,
      credits_per_request: m.credits_per_request,
      tier_label: getTierLabel(m.tier),
    }));
    
    return NextResponse.json({
      models: formattedModels,
      by_provider: byProvider,
      tier_info: {
        1: { label: 'Standard', credits: 1, description: 'Fast, cost-effective models' },
        2: { label: 'Advanced', credits: 3, description: 'Balanced performance models' },
        3: { label: 'Premium', credits: 10, description: 'Most capable models' },
      },
    });
  } catch (error) {
    console.error('Models error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}

function getTierLabel(tier: number): string {
  switch (tier) {
    case 1: return 'Standard';
    case 2: return 'Advanced';
    case 3: return 'Premium';
    default: return 'Unknown';
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

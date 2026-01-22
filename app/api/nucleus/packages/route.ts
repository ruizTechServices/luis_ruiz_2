// =============================================================================
// GET /api/nucleus/packages
// Get available credit packages for purchase
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getCreditPackages, getSubscriptionPlans } from '@/lib/nucleus/pricing';

export async function GET(request: NextRequest) {
  try {
    const [packages, subscriptions] = await Promise.all([
      getCreditPackages(),
      getSubscriptionPlans(),
    ]);
    
    // Format packages
    const formattedPackages = packages.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      credits: p.credits,
      price_cents: p.price_cents,
      price_display: `$${(p.price_cents / 100).toFixed(2)}`,
      credits_per_dollar: Math.round(p.credits / (p.price_cents / 100)),
      badge: p.badge,
    }));
    
    // Format subscriptions
    const formattedSubscriptions = subscriptions.map(s => ({
      id: s.id,
      name: s.name,
      tier: s.tier,
      description: s.description,
      price_cents: s.price_cents,
      price_display: `$${(s.price_cents / 100).toFixed(2)}`,
      billing_period: s.billing_period,
      features: s.features,
      unlimited: s.monthly_credits === null,
      monthly_credits: s.monthly_credits,
    }));
    
    return NextResponse.json({
      credit_packages: formattedPackages,
      subscription_plans: formattedSubscriptions,
    });
  } catch (error) {
    console.error('Packages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
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

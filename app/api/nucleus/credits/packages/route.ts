// =============================================================================
// NUCLEUS BOT API - /api/nucleus/credits/packages
// Get available credit packages for purchase
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { successResponse, errorResponse } from '@/lib/nucleus/auth';
import type { CreditPackage } from '@/lib/nucleus/types';

/**
 * GET /api/nucleus/credits/packages
 * Get all active credit packages
 * No authentication required - public endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: packages, error } = await supabase
      .from('nucleus_credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Failed to fetch credit packages:', error);
      return errorResponse('Failed to fetch packages', 'FETCH_ERROR', 500);
    }

    // Format for client
    const formattedPackages = (packages as CreditPackage[]).map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      credits: pkg.credits,
      price_cents: pkg.price_cents,
      price_display: `$${(pkg.price_cents / 100).toFixed(2)}`,
      badge: pkg.badge,
      credits_per_dollar: Math.round(pkg.credits / (pkg.price_cents / 100)),
    }));

    return successResponse({
      packages: formattedPackages,
    });
  } catch (err) {
    console.error('Packages error:', err);
    return errorResponse('Failed to get packages', 'PACKAGES_ERROR', 500);
  }
}

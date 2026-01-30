// =============================================================================
// NUCLEUS BOT API - /api/nucleus/user/usage
// Get user's usage history and statistics
// =============================================================================

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { authenticateBearer, errorResponse, successResponse } from '@/lib/nucleus/auth';
import { getUsageHistory, getTransactionHistory } from '@/lib/nucleus/credits';

/**
 * GET /api/nucleus/user/usage
 * Get user's usage history with optional filters
 * Query params:
 *   - limit: number (default 50)
 *   - offset: number (default 0)
 *   - start_date: ISO date string
 *   - end_date: ISO date string
 *   - include_transactions: boolean (default false)
 */
export async function GET(request: NextRequest) {
  const { user, error } = await authenticateBearer(request);
  if (error) return error;
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const includeTransactions = searchParams.get('include_transactions') === 'true';

    const supabase = await createClient();

    // Get usage logs
    const usageLogs = await getUsageHistory(supabase, user.id, {
      limit,
      offset,
      startDate,
      endDate,
    });

    // Calculate summary
    const summary = {
      total_requests: usageLogs.length,
      total_credits_used: usageLogs.reduce((sum, log) => sum + log.credits_used, 0),
      total_tokens: usageLogs.reduce((sum, log) => sum + (log.tokens_total || 0), 0),
      by_model: Object.values(
        usageLogs.reduce((acc, log) => {
          if (!acc[log.model_id]) {
            acc[log.model_id] = {
              model_id: log.model_id,
              model_name: log.model_name,
              requests: 0,
              credits: 0,
            };
          }
          acc[log.model_id].requests++;
          acc[log.model_id].credits += log.credits_used;
          return acc;
        }, {} as Record<string, { model_id: string; model_name: string; requests: number; credits: number }>)
      ),
    };

    const response: Record<string, unknown> = {
      usage: usageLogs,
      summary,
      pagination: {
        limit,
        offset,
        has_more: usageLogs.length === limit,
      },
    };

    // Optionally include transaction history
    if (includeTransactions) {
      const transactions = await getTransactionHistory(supabase, user.id, {
        limit: 50,
      });
      response.transactions = transactions;
    }

    return successResponse(response);
  } catch (err) {
    console.error('Usage history error:', err);
    return errorResponse('Failed to get usage history', 'USAGE_ERROR', 500);
  }
}

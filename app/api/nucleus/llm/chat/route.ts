// =============================================================================
// NUCLEUS BOT API - /api/nucleus/llm/chat
// Main LLM proxy endpoint - routes requests to OpenAI/Anthropic
// Handles credit deduction and usage logging
// =============================================================================

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/clients/supabase/server';
import { authenticateBearer, errorResponse, successResponse } from '@/lib/nucleus/auth';
import { 
  getCreditBalance, 
  hasActiveSubscription, 
  deductCredits, 
  logUsage 
} from '@/lib/nucleus/credits';
import { getModelInfo, DEFAULT_MODEL_PRICING } from '@/lib/nucleus/pricing';
import type { ChatRequest, ChatResponse, ModelPricing } from '@/lib/nucleus/types';

// Import LLM clients
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Initialize clients
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/nucleus/llm/chat
 * Main chat endpoint - proxies to appropriate LLM provider
 * Body: { model: string, messages: ChatMessage[], conversation_id?: string, max_tokens?: number, temperature?: number }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  const { user, error } = await authenticateBearer(request);
  if (error) return error;
  if (!user) return errorResponse('Unauthorized', 'UNAUTHORIZED', 401);

  try {
    const body: ChatRequest = await request.json();
    const { model, messages, conversation_id, max_tokens = 4096, temperature = 0.7 } = body;

    // Validate request
    if (!model) {
      return errorResponse('model is required', 'MISSING_MODEL', 400);
    }
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return errorResponse('messages array is required', 'MISSING_MESSAGES', 400);
    }

    const supabase = await createClient();

    // Get model pricing from DB first, fall back to config
    let modelPricing: ModelPricing | null = null;
    const { data: dbPricing } = await supabase
      .from('nucleus_model_pricing')
      .select('*')
      .eq('model_id', model)
      .eq('is_active', true)
      .single();

    if (dbPricing) {
      modelPricing = dbPricing as ModelPricing;
    } else {
      // Fall back to config
      const configPricing = DEFAULT_MODEL_PRICING[model];
      if (configPricing) {
        modelPricing = {
          id: '',
          model_id: model,
          model_name: configPricing.name,
          provider: configPricing.provider,
          tier: configPricing.tier,
          credits_per_request: configPricing.credits,
          is_active: true,
        };
      }
    }

    if (!modelPricing) {
      return errorResponse(
        `Model "${model}" is not supported`, 
        'UNSUPPORTED_MODEL', 
        400,
        { supported_models: Object.keys(DEFAULT_MODEL_PRICING) }
      );
    }

    const creditsNeeded = modelPricing.credits_per_request;

    // Check if user is Pro subscriber (unlimited)
    const isProSubscriber = await hasActiveSubscription(supabase, user.id);

    // If not Pro, check credit balance
    if (!isProSubscriber) {
      const balance = await getCreditBalance(supabase, user.id);
      
      if (balance < creditsNeeded) {
        return errorResponse(
          'Insufficient credits',
          'INSUFFICIENT_CREDITS',
          402,
          {
            credits_needed: creditsNeeded,
            credits_available: balance,
            model: model,
          }
        );
      }
    }

    // Route to appropriate provider
    let response: { content: string; tokens_input?: number; tokens_output?: number; finish_reason?: string };
    
    if (modelPricing.provider === 'anthropic') {
      response = await callAnthropic(model, messages, max_tokens, temperature);
    } else if (modelPricing.provider === 'openai') {
      response = await callOpenAI(model, messages, max_tokens, temperature);
    } else {
      return errorResponse(`Provider "${modelPricing.provider}" not implemented`, 'PROVIDER_NOT_IMPLEMENTED', 501);
    }

    const duration = Date.now() - startTime;

    // Deduct credits if not Pro subscriber
    let newBalance = user.profile.credit_balance;
    if (!isProSubscriber) {
      const deductResult = await deductCredits(
        supabase, 
        user.id, 
        creditsNeeded, 
        model
      );
      newBalance = deductResult.newBalance;
    }

    // Log usage
    await logUsage(supabase, {
      user_id: user.id,
      model_id: model,
      model_name: modelPricing.model_name,
      provider: modelPricing.provider,
      tier: modelPricing.tier,
      credits_used: isProSubscriber ? 0 : creditsNeeded,
      tokens_input: response.tokens_input,
      tokens_output: response.tokens_output,
      tokens_total: (response.tokens_input || 0) + (response.tokens_output || 0),
      request_duration_ms: duration,
      conversation_id: conversation_id,
    });

    // Return response
    const chatResponse: ChatResponse = {
      response: response.content,
      model: model,
      credits_used: isProSubscriber ? 0 : creditsNeeded,
      credits_remaining: isProSubscriber ? -1 : newBalance, // -1 indicates unlimited
      tokens_input: response.tokens_input,
      tokens_output: response.tokens_output,
      finish_reason: response.finish_reason,
    };

    return successResponse(chatResponse);

  } catch (err: unknown) {
    console.error('LLM Chat error:', err);
    
    // Handle specific API errors
    if (err instanceof Anthropic.APIError) {
      return errorResponse(
        `Anthropic API error: ${err.message}`,
        'ANTHROPIC_ERROR',
        err.status || 500
      );
    }
    if (err instanceof OpenAI.APIError) {
      return errorResponse(
        `OpenAI API error: ${err.message}`,
        'OPENAI_ERROR',
        err.status || 500
      );
    }
    
    return errorResponse('Failed to process chat request', 'CHAT_ERROR', 500);
  }
}

// -----------------------------------------------------------------------------
// Provider-specific implementations
// -----------------------------------------------------------------------------

async function callAnthropic(
  model: string,
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  maxTokens: number,
  temperature: number
): Promise<{ content: string; tokens_input?: number; tokens_output?: number; finish_reason?: string }> {
  const systemMsg = messages.find(m => m.role === 'system');
  const systemPrompt = systemMsg?.content;

  const filteredMessages = messages.filter(
    (m): m is { role: 'user' | 'assistant'; content: string } => m.role !== 'system'
  );

  const response = await anthropic.messages.create({
    model: model,
    max_tokens: maxTokens,
    temperature: temperature,
    system: systemPrompt,
    messages: filteredMessages,
  });

  const textContent = response.content.find(c => c.type === 'text');
  
  return {
    content: textContent?.text || '',
    tokens_input: response.usage?.input_tokens,
    tokens_output: response.usage?.output_tokens,
    finish_reason: response.stop_reason || undefined,
  };
}

async function callOpenAI(
  model: string,
  messages: { role: string; content: string }[],
  maxTokens: number,
  temperature: number
): Promise<{ content: string; tokens_input?: number; tokens_output?: number; finish_reason?: string }> {
  const response = await openai.chat.completions.create({
    model: model,
    messages: messages.map(m => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
    max_tokens: maxTokens,
    temperature: temperature,
  });

  const choice = response.choices[0];
  
  return {
    content: choice?.message?.content || '',
    tokens_input: response.usage?.prompt_tokens,
    tokens_output: response.usage?.completion_tokens,
    finish_reason: choice?.finish_reason || undefined,
  };
}

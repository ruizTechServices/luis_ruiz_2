import { z } from "zod";

/**
 * Environment variable validation.
 * Import this module at build time (via next.config.ts) to catch missing vars early.
 */

const serverSchema = z.object({
  // Supabase (required for core functionality)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),

  // Service role (required for server operations)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Nucleus JWT
  SUPABASE_JWT_ISSUER: z.string().optional(),
  SUPABASE_JWT_AUDIENCE: z.string().optional(),
  SUPABASE_JWKS_URL: z.string().url().optional(),

  // AI providers (all optional)
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  HF_API_KEY: z.string().optional(),
  XAI_API_KEY: z.string().optional(),

  // Pinecone (optional)
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_INDEX: z.string().optional(),

  // Stripe (optional unless using Nucleus payments)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Other
  OWNER_EMAILS: z.string().optional(),
  SUPABASE_PHOTOS_BUCKET: z.string().optional(),
  NUCLEUS_CORS_ORIGINS: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

/**
 * Validate and return typed environment variables.
 * Throws with a clear message listing all missing/invalid vars.
 */
export function validateEnv(): ServerEnv {
  const result = serverSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `\n\nEnvironment validation failed:\n${formatted}\n\nCheck your .env.local file.\n`
    );
  }
  return result.data;
}

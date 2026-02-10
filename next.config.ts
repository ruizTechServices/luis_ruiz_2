import type { NextConfig } from "next";

// Validate critical environment variables at build time.
// Throws in CI/Vercel builds; warns locally.
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
const missing = requiredEnvVars.filter((key) => !process.env[key]);
if (missing.length > 0) {
  const msg = `[env] Missing required environment variables: ${missing.join(", ")}`;
  if (process.env.VERCEL || process.env.CI) {
    throw new Error(msg);
  }
  console.warn(msg);
}

const nextConfig: NextConfig = {
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'huyhgdsjpdjzokjwaspb.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
    domains: ['ghchart.rshah.org', 'nextjs.org', 'react.dev', 'www.typescriptlang.org', 'tailwindcss.com', 'ui.shadcn.com', 'supabase.com'],
  },
};

export default nextConfig;

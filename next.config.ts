import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure for Replit environment
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  // Enable external packages configuration for better Replit compatibility
  serverExternalPackages: [],
  // Allow images from Supabase Storage (project: huyhgdsjpdjzokjwaspb)
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

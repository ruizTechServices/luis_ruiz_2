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
};

export default nextConfig;

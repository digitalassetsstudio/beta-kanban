import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Re-enable strict mode and type checking for production
  typescript: {
    // Only ignore build errors in development; fail in production
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  reactStrictMode: true,
  // Security headers for sovereignty
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16: Enable Cache Components for 'use cache' directive
  cacheComponents: true,

  // Next.js 16: Enable React Compiler for automatic memoization
  reactCompiler: true,

  // Custom cache profiles for different data types
  cacheLife: {
    // SSB salary data - updated infrequently, cache for longer
    ssb: {
      stale: 3600, // 1 hour stale
      revalidate: 86400, // 24 hour revalidate
      expire: 604800, // 7 day expire
    },
    // Inflation data - updated monthly, moderate cache
    inflation: {
      stale: 1800, // 30 min stale
      revalidate: 3600, // 1 hour revalidate
      expire: 86400, // 1 day expire
    },
    // AI generated content - minimal caching, almost always fresh
    ai: {
      stale: 0,
      revalidate: 60, // Revalidate every minute
      expire: 3600, // 1 hour max lifetime
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**',
      },
    ],
  },

  // Cache headers for static assets
  headers: async () => [
    {
      source: '/:all*(svg|jpg|png|webp|woff2)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],

  output: 'standalone',
}

export default nextConfig

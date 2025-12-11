import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16: Cache Components (commented - requires client component refactoring)
  // Enable when ready: cacheComponents: true,

  // Next.js 16: Enable React Compiler for automatic memoization
  reactCompiler: true,

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
  output: 'standalone',
}

export default nextConfig

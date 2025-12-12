import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Next.js 16: Enable Cache Components for 'use cache' directive
  cacheComponents: true,

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

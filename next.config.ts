/** @type {import('next').NextConfig} */
module.exports = {
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
  eslint: {
    // Disable no-page-custom-font rule for App Router
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'features', 'lib'],
  },
}

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-gatekeeper-uploads.fresha.com',
      },
      {
        protocol: 'https',
        hostname: 'cncqiabrkazknvxxjfms.supabase.co',
      },
    ],
  },
}

export default nextConfig

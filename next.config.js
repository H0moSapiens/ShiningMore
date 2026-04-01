/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.placeholder.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
}

module.exports = nextConfig

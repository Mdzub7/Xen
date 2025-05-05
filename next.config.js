/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: false
  },
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false
      }
    }
    return config
  }
}

module.exports = nextConfig
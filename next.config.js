/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: [
      'src/app',
      'src/components',
      'src/lib',
      'src/types',
      'public'
    ],
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  distDir: '.next',
  images: {
    domains: ['rankshare.app', 'img.clerk.com'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false,
      net: false,
      tls: false,
      dns: false,
      punycode: false,
    };
    return config;
  },
  experimental: {
    webpackBuildWorker: false,
  },
};

module.exports = nextConfig; 
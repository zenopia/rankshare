/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  distDir: '.next',
  env: {
    NODE_ENV: process.env.NODE_ENV,
  },
  images: {
    domains: ['rankshare.app'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
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
}

module.exports = nextConfig; 
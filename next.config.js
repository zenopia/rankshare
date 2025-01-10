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
  output: 'standalone',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_next' : undefined,
  staticPageGenerationTimeout: 180,
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rankshare.app',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/7.x/**',
      },
    ],
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = { 
      fs: false,
      net: false,
      tls: false,
      dns: false,
      punycode: false,
    };

    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
    };

    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 25,
          minSize: 20000
        }
      };
    }

    return config;
  },
  experimental: {
    webpackBuildWorker: false,
    optimizeCss: true,
    legacyBrowsers: false,
  },
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
        has: [
          {
            type: 'query',
            key: 'q',
            value: undefined,
          },
        ],
      },
    ];
  },
  headers: async () => {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  generateBuildId: async () => {
    return 'build-' + Date.now();
  }
};

module.exports = nextConfig; 
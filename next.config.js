/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com'
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev'
      }
    ]
  },
  experimental: {
    webpackBuildWorker: false
  }
  // Temporarily disabled CSP for testing
  // async headers() {
  //   return [
  //     {
  //       source: '/:path*',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: [
  //             "default-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://*.favely.net",
  //             "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://*.favely.net",
  //             "connect-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://*.favely.net",
  //             "style-src 'self' 'unsafe-inline'",
  //             "frame-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://*.favely.net",
  //             "img-src 'self' data: https://* blob:",
  //             "media-src 'self'",
  //             "font-src 'self' data:",
  //             "worker-src 'self' blob:",
  //             "manifest-src 'self'",
  //             "object-src 'none'"
  //           ].join('; ')
  //         },
  //         {
  //           key: 'Access-Control-Allow-Origin',
  //           value: 'https://clerk.favely.net'
  //         }
  //       ]
  //     }
  //   ];
  // }
};

module.exports = nextConfig; 
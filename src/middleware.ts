import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isDevelopment = process.env.NODE_ENV === 'development';

const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': isDevelopment 
    ? "" // Disable CSP in development
    : "default-src 'self' https://*.clerk.dev https://*.clerk.com https://*.favely.net; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://*.favely.net https://challenges.cloudflare.com https://*.cloudflare.com https://*.googletagmanager.com https://www.google-analytics.com; " +
      "worker-src 'self' blob:; " +
      "style-src 'self' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com https://*.favely.net; " +
      "img-src 'self' blob: data: https: https://*.clerk.dev https://*.clerk.com https://img.clerk.com https://*.favely.net https://*.google-analytics.com https://*.googletagmanager.com; " +
      "font-src 'self' data: https://*.clerk.dev https://*.clerk.com https://*.favely.net; " +
      "frame-src 'self' https://*.clerk.dev https://*.clerk.com https://*.favely.net https://challenges.cloudflare.com https://*.googletagmanager.com; " +
      "connect-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://*.favely.net https://*.cloudflare.com wss://*.clerk.com https://*.google-analytics.com https://*.googletagmanager.com https://*.analytics.google.com",
  'Permissions-Policy': 
    'camera=(), microphone=(), geolocation=()'
};

interface AuthObject {
  userId: string | null;
  isPublicRoute: boolean;
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|_vercel|[\\w-]+\\.\\w+).*)",
    "/(api|trpc)(.*)",
    "/profile/:username(.*)"
  ]
};

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/search",
    "/lists/:path*",
    "/api/lists/:path*",
    "/api/users/:path*",
    "/api/webhooks/clerk",
    "/api/webhooks/user",
    "/manifest.json",
    "/api/health",
    "/:path/_rsc",
    "/profile/:username/_rsc",
    // Only allow public access to user list pages
    "/profile/:username/lists/:listId",
    // Add auth-related routes
    "/sso-callback",
    "/sign-in/(.*)",
    "/sign-up/(.*)",
    // Add user profile routes
    "/profile/:username/following",
    "/profile/:username/followers",
    "/profile/:username",
    // Add public pages
    "/about",
    "/about/(.*)",
    "/feedback",
    "/feedback/(.*)"
  ],
  debug: false
});

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
    : "default-src 'self' https://*.clerk.dev https://*.clerk.com; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev; " +
      "style-src 'self' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com; " +
      "img-src 'self' blob: data: https: https://*.clerk.dev https://*.clerk.com https://img.clerk.com; " +
      "font-src 'self' data: https://*.clerk.dev https://*.clerk.com; " +
      "frame-src 'self' https://*.clerk.dev https://*.clerk.com; " +
      "connect-src 'self' https://*.clerk.dev https://*.clerk.com https://clerk.rankshare.com wss://*.clerk.com",
  'Permissions-Policy': 
    'camera=(), microphone=(), geolocation=()'
};

// Export the auth middleware with updated config
export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/search",
    "/lists/:path*",
    "/api/lists/:path*",
    "/:username*",
    "/@:username*",
    "/users/:path*/lists",
    "/api/profile",
    "/api/webhooks/clerk",
    "/api/webhooks/user",
    "/manifest.json",
    "/api/health",
  ],
  beforeAuth: (req: NextRequest) => {
    const { pathname } = req.nextUrl;

    // Handle @ routes before auth
    if (pathname.startsWith('/@')) {
      const username = pathname.slice(2);
      const url = new URL(req.url);
      url.pathname = `/${username}`;
      return NextResponse.rewrite(url);
    }

    const res = NextResponse.next();

    // Apply security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      if (value) { // Only set header if value is not empty
        res.headers.set(key, value);
      }
    });

    return res;
  },
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/(api|trpc)(.*)",
    "/@:username*"
  ]
};

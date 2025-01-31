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
} as const;

interface AuthObject {
  userId: string | null;
  isPublicRoute: boolean;
  sessionId: string | null;
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
  debug: false,
  beforeAuth: (req: NextRequest) => {
    // Handle preflight requests for mobile browsers
    if (req.method === 'OPTIONS') {
      return NextResponse.next();
    }

    // Add CORS headers for mobile browsers
    const response = NextResponse.next();
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  },
  afterAuth: (auth: AuthObject, req: NextRequest) => {
    // Handle authentication result
    const response = NextResponse.next();
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Special handling for mobile browsers to maintain session
    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
    
    if (isMobile && auth.userId) {
      // Add cache control headers to prevent session loss
      response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }

    // Handle protected routes
    const url = new URL(req.url);
    const isProtectedRoute = 
      // Profile management routes
      (url.pathname.startsWith('/profile/lists') && !url.pathname.includes('/lists/')) ||
      url.pathname.includes('/pinned') || 
      url.pathname.includes('/collab') ||
      url.pathname.includes('/create') ||
      url.pathname.includes('/edit') ||
      // API routes that require auth
      (url.pathname.startsWith('/api/') && 
       !url.pathname.startsWith('/api/lists/') && 
       !url.pathname.startsWith('/api/users/') &&
       !url.pathname.startsWith('/api/webhooks/') &&
       // Allow access to following/followers API routes
       !url.pathname.includes('/following') &&
       !url.pathname.includes('/followers'));

    if (isProtectedRoute && !auth.userId) {
      // Store the return URL in the URL parameters
      const returnUrl = encodeURIComponent(url.pathname + url.search);
      return NextResponse.redirect(new URL(`/sign-in?returnUrl=${returnUrl}`, req.url));
    }

    return response;
  }
});

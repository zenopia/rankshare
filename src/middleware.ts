import { NextResponse, type NextRequest } from "next/server";
import { authMiddleware } from "@clerk/nextjs/server";
import { AuthFactory } from "@/lib/auth/factory";
import { authConfig } from "@/lib/auth/config";

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

// Apply Clerk's auth middleware first
const clerkMiddleware = authMiddleware({
  publicRoutes: [
    ...authConfig.publicRoutes,
    "/profile/:username/followers",
    "/profile/:username/following"
  ],
  ignoredRoutes: [
    "/_next",
    "/favicon.ico",
    "/api/webhooks(.*)"
  ]
});

// Export the config separately for Next.js
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|_vercel|[\\w-]+\\.\\w+).*)",
    "/(api|trpc)(.*)",
    "/profile/lists(.*)",
    "/profile/edit(.*)",
    "/profile/settings(.*)",
    "/create(.*)",
    "/lists/create(.*)",
    "/lists/edit/(.*)"
  ]
};

export default async function middleware(req: NextRequest) {
  // Handle preflight requests for mobile browsers
  if (req.method === 'OPTIONS') {
    return NextResponse.next();
  }

  // Apply Clerk's auth middleware
  const clerkResponse = await clerkMiddleware(req);
  if (clerkResponse) {
    return clerkResponse;
  }

  // Initialize response with security headers
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Get auth provider instance
  const auth = await AuthFactory.getProvider('clerk', authConfig);

  // Handle API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const authResult = await auth.handleApiAuth(req);
    
    if (!authResult.isAuthenticated) {
      return new NextResponse(
        JSON.stringify({ 
          error: authResult.error || 'Unauthorized',
          status: 401 
        }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers)
          }
        }
      );
    }
    return response;
  }

  // Handle page routes
  const authResult = await auth.validateSession();
  const url = new URL(req.url);

  // Special handling for mobile browsers to maintain session
  const userAgent = req.headers.get('user-agent') || '';
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
  
  if (isMobile && authResult.userId) {
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Check if the route requires authentication
  if (auth.requiresAuth(url.pathname) && !authResult.isAuthenticated) {
    const returnUrl = encodeURIComponent(url.pathname + url.search);
    return NextResponse.redirect(new URL(`/sign-in?returnUrl=${returnUrl}`, req.url));
  }

  return response;
}

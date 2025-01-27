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
    "/:path*/_rsc",
    "/@:path*/_rsc",
    // Only allow public access to user list pages
    "/:username/lists/:listId",
    "/@:username/lists/:listId"
  ],
  async afterAuth(auth: AuthObject, req: NextRequest) {
    const url = req.nextUrl;

    // If the user is signed in and trying to access auth pages, redirect to home
    if (auth.userId && (url.pathname === '/sign-in' || url.pathname === '/sign-up')) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
        `https://${req.headers.get('host') || 'favely.net'}`;
      return NextResponse.redirect(new URL('/', baseUrl));
    }

    // Handle profile route redirects
    if (url.pathname.startsWith('/profile/')) {
      const path = url.pathname.slice('/profile/'.length);
      if (auth.userId) {
        // Get user from Clerk
        const clerkUrl = `${process.env.CLERK_API_URL}/users/${auth.userId}`;
        const response = await fetch(clerkUrl, {
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        const user = await response.json();
        if (user.username) {
          // Redirect to /@username/following or /@username/followers
          return NextResponse.redirect(new URL(`/@${user.username}/${path}`, req.url));
        }
      }
      // If not signed in or no username, redirect to sign in
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Apply security headers to all responses
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      if (value) response.headers.set(key, value);
    });
    return response;
  }
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next|_vercel|[\\w-]+\\.\\w+).*)",
    "/(api|trpc)(.*)",
    "/@:username*"
  ]
};

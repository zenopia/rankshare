import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isDevelopment = process.env.NODE_ENV === 'development';
const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'https://accounts.favely.net/sign-in';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://favely.net';

const securityHeaders = {
  'X-DNS-Prefetch-Control': 'on',
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': isDevelopment 
    ? "" // Disable CSP in development
    : "default-src 'self' https://*.clerk.dev https://*.clerk.com https://*.favely.net https://accounts.favely.net; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://*.favely.net https://accounts.favely.net https://accounts.google.com; " +
      "worker-src 'self' blob:; " +
      "style-src 'self' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com; " +
      "img-src 'self' blob: data: https: https://*.clerk.dev https://*.clerk.com https://img.clerk.com https://lh3.googleusercontent.com; " +
      "font-src 'self' data: https://*.clerk.dev https://*.clerk.com; " +
      "frame-src 'self' https://*.clerk.dev https://*.clerk.com https://*.favely.net https://accounts.favely.net https://accounts.google.com; " +
      "connect-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://clerk.favely.net https://*.favely.net https://accounts.favely.net https://accounts.google.com wss://*.clerk.com",
  'Permissions-Policy': 
    'camera=(), microphone=(), geolocation=()'
};

export default authMiddleware({
  publicRoutes: [
    "/",
    "/search",
    "/lists/:path*",
    "/api/lists/:path*",
    "/users/:path*/lists",
    "/api/webhooks/clerk",
    "/api/webhooks/user",
    "/manifest.json",
    "/api/health",
    "/api/users/batch",
    "/profile",
    "/api/profile",
    "/privacy",
    "/terms",
    "/about",
    // Username routes - exclude sign-in and sign-up
    "/@:username*",
    {
      matcher: "/:username*",
      not: ["/sign-in*", "/sign-up*"]
    }
  ],
  signInUrl: SIGN_IN_URL,
  afterAuth(auth: { userId: string | null; isPublicRoute: boolean }, req: NextRequest) {
    // Apply security headers to all responses
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      if (value) response.headers.set(key, value);
    });

    // If user is not signed in and route is not public, let Clerk handle the redirect
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL(SIGN_IN_URL);
      const returnUrl = new URL(req.url);
      // Ensure the return URL uses the main app domain
      returnUrl.protocol = new URL(APP_URL).protocol;
      returnUrl.host = new URL(APP_URL).host;
      signInUrl.searchParams.set('redirect_url', returnUrl.toString());
      return NextResponse.redirect(signInUrl);
    }

    // If user is signed in and trying to access auth pages, redirect to home
    if (auth.userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return response;
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/(api|trpc)(.*)"
  ]
};

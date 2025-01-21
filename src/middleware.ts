import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isDevelopment = process.env.NODE_ENV === 'development';
const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'https://accounts.favely.net/sign-in';

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

interface AuthObject {
  userId: string | null;
  isPublicRoute: boolean;
}

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
  async afterAuth(auth: AuthObject, req: NextRequest) {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Create base response headers including CORS and security headers
    const baseHeaders = {
      ...securityHeaders,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Get the pathname
    const pathname = req.nextUrl.pathname;

    // For API routes when not signed in, return 401
    if (!auth.userId && !auth.isPublicRoute && req.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse(null, { 
        status: 401,
        headers: baseHeaders
      });
    }

    // If the user is not signed in and the route is not public, redirect to sign-in
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL(SIGN_IN_URL);
      const returnUrl = new URL(req.url);
      // Ensure the return URL uses the same domain as the sign-in URL
      returnUrl.protocol = signInUrl.protocol;
      returnUrl.host = signInUrl.host;
      signInUrl.searchParams.set('redirect_url', returnUrl.toString());
      return NextResponse.redirect(signInUrl, {
        headers: baseHeaders
      });
    }

    // If the user is signed in and trying to access auth pages, redirect to home
    if (auth.userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
      return NextResponse.redirect(new URL('/', req.url), {
        headers: baseHeaders
      });
    }

    // Skip profile check for the profile page itself and public routes
    if (pathname === '/profile' || auth.isPublicRoute) {
      return NextResponse.next({
        headers: baseHeaders
      });
    }

    // If the user is signed in and not on a public route, check their profile
    if (auth.userId && !auth.isPublicRoute) {
      try {
        // Construct the profile API URL using the same origin as the request
        const profileApiUrl = new URL('/api/profile', req.url);
        
        // Fetch the user's profile
        const profileRes = await fetch(profileApiUrl, {
          headers: {
            'Cookie': req.headers.get('cookie') || '',
            'Authorization': req.headers.get('authorization') || '',
          }
        });

        if (!profileRes.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await profileRes.json();
        
        // If profile is not complete, redirect to profile page
        if (!data.profile?.profileComplete) {
          const profileUrl = new URL('/profile', req.url);
          profileUrl.searchParams.set('returnUrl', req.url);
          return NextResponse.redirect(profileUrl, {
            headers: baseHeaders
          });
        }

        // If profile is complete, proceed normally
        return NextResponse.next({
          headers: baseHeaders
        });
      } catch (error) {
        console.error('Error checking profile:', error);
        // On error, redirect to profile page
        const profileUrl = new URL('/profile', req.url);
        profileUrl.searchParams.set('returnUrl', req.url);
        return NextResponse.redirect(profileUrl, {
          headers: baseHeaders
        });
      }
    }

    // Default response
    return NextResponse.next({
      headers: baseHeaders
    });
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/(api|trpc)(.*)"
  ]
};

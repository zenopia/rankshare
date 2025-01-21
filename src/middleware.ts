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
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://*.favely.net https://accounts.favely.net; " +
      "worker-src 'self' blob:; " +
      "style-src 'self' 'unsafe-inline' https://*.clerk.dev https://*.clerk.com; " +
      "img-src 'self' blob: data: https: https://*.clerk.dev https://*.clerk.com https://img.clerk.com; " +
      "font-src 'self' data: https://*.clerk.dev https://*.clerk.com; " +
      "frame-src 'self' https://*.clerk.dev https://*.clerk.com https://*.favely.net https://accounts.favely.net; " +
      "connect-src 'self' https://*.clerk.dev https://*.clerk.com https://*.clerk.accounts.dev https://clerk.favely.net https://*.favely.net https://accounts.favely.net wss://*.clerk.com",
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
    "/profile",
    // Username routes - exclude sign-in and sign-up
    "/@:username*",
    {
      matcher: "/:username*",
      not: ["/sign-in*", "/sign-up*"]
    }
  ],
  signInUrl: SIGN_IN_URL,
  async afterAuth(auth: AuthObject, req: NextRequest) {
    // If the user is not signed in and the route is not public, redirect to sign-in
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL(SIGN_IN_URL);
      const returnUrl = new URL(req.url).toString();
      signInUrl.searchParams.set('redirect_url', returnUrl);
      return NextResponse.redirect(signInUrl);
    }

    // If the user is signed in and trying to access auth pages, redirect to home
    if (auth.userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Get the pathname and full URL
    const pathname = req.nextUrl.pathname;
    const fullUrl = req.nextUrl.href;

    // Skip profile check for the profile page itself and public routes
    if (pathname === '/profile' || auth.isPublicRoute) {
      const response = NextResponse.next();
      // Apply security headers
      Object.entries(securityHeaders).forEach(([key, value]) => {
        if (value) response.headers.set(key, value);
      });
      return response;
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
        
        // If profile is not complete, redirect to profile page with encoded return URL
        if (!data.profile?.profileComplete) {
          const profileUrl = new URL('/profile', req.url);
          profileUrl.searchParams.set('returnUrl', encodeURIComponent(fullUrl));
          const response = NextResponse.redirect(profileUrl);
          // Apply security headers
          Object.entries(securityHeaders).forEach(([key, value]) => {
            if (value) response.headers.set(key, value);
          });
          return response;
        }

        // If profile is complete, proceed normally
        const response = NextResponse.next();
        // Apply security headers
        Object.entries(securityHeaders).forEach(([key, value]) => {
          if (value) response.headers.set(key, value);
        });
        return response;
      } catch (error) {
        console.error('Error checking profile:', error);
        // On error, redirect to profile page with encoded return URL
        const profileUrl = new URL('/profile', req.url);
        profileUrl.searchParams.set('returnUrl', encodeURIComponent(fullUrl));
        const response = NextResponse.redirect(profileUrl);
        // Apply security headers
        Object.entries(securityHeaders).forEach(([key, value]) => {
          if (value) response.headers.set(key, value);
        });
        return response;
      }
    }

    const response = NextResponse.next();
    // Apply security headers to all responses
    Object.entries(securityHeaders).forEach(([key, value]) => {
      if (value) response.headers.set(key, value);
    });
    return response;
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

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
    "/:username*",
    "/@:username*",
    "/users/:path*/lists",
    "/api/webhooks/clerk",
    "/api/webhooks/user",
    "/manifest.json",
    "/api/health",
    "/:path*/_rsc",
    "/@:username*/_rsc",
  ],
  async afterAuth(auth: AuthObject, req: NextRequest) {
    // If the user is not signed in and the route is not public, redirect to sign-in
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('returnUrl', req.url);
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
        // Get the origin from the request URL
        const origin = new URL(req.url).origin;
        // Construct the profile API URL using the request's origin
        const profileApiUrl = `${origin}/api/profile`;
        
        console.log('Checking profile at:', profileApiUrl);
        
        // Fetch the user's profile with proper headers
        const profileRes = await fetch(profileApiUrl, {
          method: 'GET',
          headers: {
            'Cookie': req.headers.get('cookie') || '',
            'Authorization': `Bearer ${auth.userId}`,
            'Content-Type': 'application/json',
            // Pass through the host header to ensure correct routing
            'Host': req.headers.get('host') || '',
            // Pass through x-forwarded headers if they exist
            ...(req.headers.get('x-forwarded-proto') ? { 'x-forwarded-proto': req.headers.get('x-forwarded-proto') || '' } : {}),
            ...(req.headers.get('x-forwarded-host') ? { 'x-forwarded-host': req.headers.get('x-forwarded-host') || '' } : {}),
            ...(req.headers.get('x-forwarded-for') ? { 'x-forwarded-for': req.headers.get('x-forwarded-for') || '' } : {})
          },
          credentials: 'include',
        });

        console.log('Profile response status:', profileRes.status);

        if (!profileRes.ok) {
          const errorText = await profileRes.text();
          console.error('Profile fetch failed:', {
            status: profileRes.status,
            statusText: profileRes.statusText,
            error: errorText
          });
          // Instead of throwing, let's proceed normally
          const response = NextResponse.next();
          Object.entries(securityHeaders).forEach(([key, value]) => {
            if (value) response.headers.set(key, value);
          });
          return response;
        }

        const data = await profileRes.json();
        console.log('Profile data:', data);
        
        // If profile doesn't exist or is not complete, redirect to profile page
        if (!data.profile) {
          console.log('No profile found, redirecting to profile page');
          const profileUrl = new URL('/profile', req.url);
          profileUrl.searchParams.set('returnUrl', encodeURIComponent(fullUrl));
          const response = NextResponse.redirect(profileUrl);
          Object.entries(securityHeaders).forEach(([key, value]) => {
            if (value) response.headers.set(key, value);
          });
          return response;
        }

        // If profile exists, proceed normally regardless of completion status
        const response = NextResponse.next();
        Object.entries(securityHeaders).forEach(([key, value]) => {
          if (value) response.headers.set(key, value);
        });
        return response;

      } catch (error) {
        console.error('Error checking profile:', error);
        // On error, proceed normally instead of redirecting
        const response = NextResponse.next();
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
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/(api|trpc)(.*)",
    "/@:username*"
  ]
};

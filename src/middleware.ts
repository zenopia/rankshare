import { authMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ClerkState } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in',
    '/sign-up',
    '/search',
    '/lists/:id',
    '/api/lists/search',
    '/api/health',
    '/manifest.json',
  ],
  ignoredRoutes: [
    '/_next',
    '/favicon.ico',
    '/api/webhooks',
    '/images',
    '/static',
  ],
  afterAuth(auth: ClerkState, req: NextRequest) {
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  },
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

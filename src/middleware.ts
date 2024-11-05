import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/search',
    '/lists/(.*)',
    '/api/lists/search',
  ],
  ignoredRoutes: [
    '/_next(.*)',
    '/favicon.ico',
    '/api/webhooks(.*)',
    '/images/(.*)',
  ]
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/((?!webhooks).*)',
  ],
};

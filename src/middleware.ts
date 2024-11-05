import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/search',
    '/lists/(.*)',
    '/api/lists/search',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ],
  ignoredRoutes: [
    '/api/webhooks(.*)',
  ]
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};

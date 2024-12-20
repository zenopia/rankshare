import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ClerkState } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/search",
    "/lists/:path*",
    "/api/lists/:path*",
    "/users/:path*/lists",
    "/api/profile",
    "/api/webhooks/clerk",
    "/api/webhooks/user",
    "/manifest.json",
    "/api/health",
  ],
  async afterAuth(auth: ClerkState, req: NextRequest) {
    // Allow public routes and API routes
    if (auth.isPublicRoute || req.url.includes('/api/')) {
      return NextResponse.next();
    }

    // If not signed in and trying to access protected route
    if (!auth.userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next/static|_next/image|favicon.ico).*)", "/"],
};

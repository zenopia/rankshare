import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Export the auth middleware with updated config
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
    "/api/profile",
    "/api/webhooks/clerk",
    "/api/webhooks/user",
    "/manifest.json",
    "/api/health",
  ],
  beforeAuth: (req: NextRequest) => {
    const { pathname } = req.nextUrl;
    console.log('Middleware pathname:', pathname);

    // Handle @ routes before auth
    if (pathname.startsWith('/@')) {
      const username = pathname.slice(2);
      const url = new URL(req.url);
      url.pathname = `/${username}`;
      console.log('Rewriting to:', url.pathname);
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  },
});

// Update matcher config
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/(api|trpc)(.*)",
    "/@:username*"
  ]
};

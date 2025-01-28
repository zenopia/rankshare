import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/about",
    "/about/privacy",
    "/about/terms",
    "/sign-in",
    "/sign-up",
    "/api/public(.*)",
    "/search(.*)"
  ],
  ignoredRoutes: [
    "/api/public(.*)",
    "/_next(.*)",
    "/favicon.ico",
    "/fonts(.*)"
  ]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}; 
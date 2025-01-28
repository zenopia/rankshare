import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

interface AuthObject {
  userId: string | null;
  isPublicRoute: boolean;
  sessionId: string | null;
}

// URL patterns for consistent routing
const USER_ROUTES = {
  profile: "/@:username",
  lists: "/@:username/lists",
  followers: "/@:username/followers",
  following: "/@:username/following",
  specificList: "/@:username/lists/:listId"
} as const;

const APP_ROUTES = {
  dashboard: "/app/dashboard",
  myLists: "/app/lists",
  pinned: "/app/pinned",
  collab: "/app/collab",
  settings: "/app/settings"
} as const;

const STATIC_ROUTES = {
  home: "/",
  about: "/about",
  feedback: "/feedback",
  search: "/search"
} as const;

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/about",
  "/search",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/@(.*)",
  "/api/webhook(.*)",
];

// Routes that require authentication
const protectedRoutes = [
  "/app(.*)",
  "/settings(.*)",
];

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

export default authMiddleware({
  publicRoutes: [
    "/",
    "/about",
    "/search",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/sso-callback(.*)",
    "/@(.*)",
    "/api/webhook(.*)",
  ],
  ignoredRoutes: ["/api/webhook(.*)"],
  debug: process.env.NODE_ENV === "development",
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

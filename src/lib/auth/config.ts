import { AuthProviderConfig } from './types';

export const authConfig: AuthProviderConfig = {
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/search",
    "/lists/:path*",
    "/api/lists/:path*",
    "/api/users/:path*",
    "/api/webhooks/clerk",
    "/api/webhooks/user",
    "/manifest.json",
    "/api/health",
    "/:path/_rsc",
    "/profile/:username/_rsc",
    "/profile/:username/lists/:listId",
    "/sso-callback",
    "/sign-in/(.*)",
    "/sign-up/(.*)",
    "/profile/:username/following",
    "/profile/:username/followers",
    "/profile/:username",
    "/about",
    "/about/(.*)",
    "/feedback",
    "/feedback/(.*)"
  ],
  protectedRoutes: [
    "/profile/lists",
    "/profile/edit",
    "/profile/settings",
    "/create",
    "/lists/create",
    "/lists/edit/:listId"
  ],
  apiConfig: {
    publicPaths: [
      "/api/health",
      "/api/webhooks/clerk",
      "/api/webhooks/user",
      "/api/lists/[^/]+$", // Individual list endpoints
      "/api/users/[^/]+$", // Public user profile endpoints
      "/api/search"
    ],
    protectedPaths: [
      "/api/lists/create",
      "/api/lists/edit",
      "/api/lists/delete",
      "/api/profile",
      "/api/collaborations"
    ]
  }
}; 
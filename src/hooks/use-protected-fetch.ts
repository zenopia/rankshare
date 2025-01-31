import { useAuthGuard } from "./use-auth-guard";
import { useUser } from "@clerk/nextjs";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export function useProtectedFetch() {
  const { getToken } = useAuthGuard();
  const { isSignedIn } = useUser();

  const fetchWithAuth = async (url: string, options: FetchOptions = {}) => {
    const { requireAuth = true, headers = {}, ...rest } = options;

    try {
      // Only try to get token if auth is required or user is signed in
      let token = null;
      if (requireAuth || isSignedIn) {
        token = await getToken();
        if (!token && /Mobile|Android|iPhone/i.test(window.navigator.userAgent)) {
          // Try one more time for mobile browsers
          await new Promise(resolve => setTimeout(resolve, 100));
          token = await getToken();
        }
      }

      // Only throw if auth is required and we don't have a token
      if (requireAuth && !token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(url, {
        ...rest,
        headers: {
          ...headers,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      });

      // Special handling for 404s on status endpoints
      if (!response.ok) {
        if (response.status === 404 && url.endsWith('/status')) {
          // Return default values for status endpoints
          return {
            ok: true,
            json: async () => ({
              isPinned: false,
              isFollowing: false,
              isCollaborator: false
            })
          } as Response;
        }

        if (response.status === 401) {
          // Handle unauthorized specifically
          throw new Error("Unauthorized");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Protected fetch error:', error);
      throw error;
    }
  };

  return { fetchWithAuth };
} 
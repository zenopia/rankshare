import { useAuthGuard } from "./use-auth-guard";

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

export function useProtectedFetch() {
  const { getToken } = useAuthGuard();

  const fetchWithAuth = async (url: string, options: FetchOptions = {}) => {
    const { requireAuth = true, headers = {}, ...rest } = options;

    try {
      // Get token with retry for mobile
      let token = await getToken();
      if (!token && /Mobile|Android|iPhone/i.test(window.navigator.userAgent)) {
        // Try one more time for mobile browsers
        await new Promise(resolve => setTimeout(resolve, 100));
        token = await getToken();
      }

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

      if (!response.ok) {
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
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface UseAuthGuardProps {
  protected?: boolean;
  redirectIfAuthed?: boolean;
}

export function useAuthGuard({ protected: isProtected = false, redirectIfAuthed = false }: UseAuthGuardProps = {}) {
  const { 
    isLoaded, 
    isSignedIn, 
    getToken,
    sessionId 
  } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Reset ready state when session changes
    if (!isLoaded || !sessionId) {
      setIsReady(false);
      return;
    }

    const checkAuth = async () => {
      try {
        // Get fresh token to validate session
        const token = await getToken();
        
        if (isProtected && !isSignedIn) {
          // Redirect to sign in if trying to access protected route while not signed in
          const returnUrl = encodeURIComponent(pathname);
          router.push(`/sign-in?returnUrl=${returnUrl}`);
          return;
        }

        if (redirectIfAuthed && isSignedIn) {
          // Redirect to home if trying to access auth pages while signed in
          router.push('/');
          return;
        }

        // Only set ready if we have a valid token and session
        if (token && sessionId) {
          setIsReady(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsReady(false);
        if (isProtected) {
          router.push('/sign-in');
        }
      }
    };

    checkAuth();
  }, [isLoaded, isSignedIn, sessionId, isProtected, redirectIfAuthed, pathname, router, getToken]);

  return {
    isReady: isLoaded && isReady,
    isSignedIn,
    isLoaded,
    getToken
  };
} 
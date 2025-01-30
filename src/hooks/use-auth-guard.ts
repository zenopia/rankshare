import { useAuth } from "@/contexts/auth.context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface UseAuthGuardProps {
  protected?: boolean;
  redirectIfAuthed?: boolean;
}

export function useAuthGuard({ protected: isProtected = false, redirectIfAuthed = false }: UseAuthGuardProps = {}) {
  const { isLoaded, isSignedIn, getToken, user } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Auth pages should be immediately ready
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  
  useEffect(() => {
    // Auth pages are always ready and don't need token validation
    if (isAuthPage) {
      setIsReady(true);
      return;
    }

    // Reset ready state when session changes
    if (!isLoaded) {
      setIsReady(false);
      return;
    }

    // Handle sign-out
    if (isLoaded && !isSignedIn && !isAuthPage && !user) {
      router.push('/');
      return;
    }

    // Reset ready state when session changes
    if (!user) {
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

        // Only set ready if we have a valid token
        if (token) {
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
  }, [isLoaded, isSignedIn, user, isProtected, redirectIfAuthed, pathname, router, getToken, isAuthPage]);

  return {
    isReady: isAuthPage || (isLoaded && isReady),
    isSignedIn,
    isLoaded,
    getToken
  };
} 
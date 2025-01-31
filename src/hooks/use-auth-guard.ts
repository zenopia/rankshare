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
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Auth pages should be immediately ready
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
  
  useEffect(() => {
    let mounted = true;
    
    const validateSession = async () => {
      try {
        // Skip validation for auth pages
        if (isAuthPage) {
          if (mounted) {
            setIsValidating(false);
            setIsReady(true);
          }
          return;
        }

        // Reset ready state when session changes
        if (!isLoaded) {
          if (mounted) {
            setIsReady(false);
            setIsValidating(true);
          }
          return;
        }

        // Handle sign-out
        if (isLoaded && !isSignedIn && !isAuthPage && !user) {
          router.push('/');
          return;
        }

        // Reset ready state when session changes
        if (!user) {
          if (mounted) {
            setIsReady(false);
            setIsValidating(true);
          }
          return;
        }

        // Validate token
        const token = await getToken();
        
        if (mounted) {
          setIsValidating(false);
          
          if (isProtected && !token) {
            // Redirect to sign in if trying to access protected route without valid token
            const returnUrl = encodeURIComponent(pathname);
            router.push(`/sign-in?returnUrl=${returnUrl}`);
            return;
          }

          if (redirectIfAuthed && token) {
            // Redirect to home if trying to access auth pages with valid token
            router.push('/');
            return;
          }

          // Only set ready if we have a valid token or it's not required
          setIsReady(!isProtected || !!token);
        }
      } catch (error) {
        console.error('Auth validation failed:', error);
        if (mounted) {
          setIsValidating(false);
          setIsReady(false);
          if (isProtected) {
            router.push('/sign-in');
          }
        }
      }
    };

    validateSession();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, user, isProtected, redirectIfAuthed, pathname, router, getToken, isAuthPage]);

  return {
    isReady: isAuthPage || (isLoaded && isReady && !isValidating),
    isSignedIn,
    isLoaded,
    getToken
  };
} 
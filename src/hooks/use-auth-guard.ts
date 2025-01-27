import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface UseAuthGuardProps {
  protected?: boolean;
  redirectIfAuthed?: boolean;
}

export function useAuthGuard({ protected: isProtected = false, redirectIfAuthed = false }: UseAuthGuardProps = {}) {
  const { 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoaded, isSignedIn, getToken 
  } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    const checkAuth = async () => {
      try {
        // Get fresh token
        const _token = await getToken();
        
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

        setIsReady(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isProtected) {
          router.push('/sign-in');
        }
      }
    };

    checkAuth();
  }, [isLoaded, isSignedIn, isProtected, redirectIfAuthed, pathname, router, getToken]);

  return {
    isReady,
    isSignedIn,
    isLoaded,
    getToken
  };
} 
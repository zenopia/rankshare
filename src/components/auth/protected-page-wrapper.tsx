"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth.context";
import { MainLayout } from "@/components/layout/main-layout";
import { SubLayout } from "@/components/layout/sub-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  initialUser: {
    id: string;
    username: string | null;
    fullName: string | null;
    imageUrl: string;
  };
  layoutType?: "main" | "sub";
  title?: string;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

export function ProtectedPageWrapper({ 
  children, 
  initialUser,
  layoutType = "main",
  title
}: ProtectedPageWrapperProps) {
  const { isLoaded, getToken, user } = useAuth();
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const router = useRouter();

  // Validate session token
  useEffect(() => {
    let mounted = true;

    const validateSession = async () => {
      try {
        if (!isLoaded || !user) {
          if (mounted) {
            setIsValidated(false);
          }
          return;
        }

        // Special handling for mobile browsers
        const isMobile = typeof window !== 'undefined' && 
          /Mobile|Android|iPhone/i.test(window.navigator.userAgent);

        // Get token with retries for mobile
        let token = null;
        if (isMobile) {
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            token = await getToken();
            if (token) break;
            
            // Wait before retry with exponential backoff
            await new Promise(resolve => 
              setTimeout(resolve, Math.min(100 * Math.pow(2, retryCount), 1000))
            );
            retryCount++;
          }
        } else {
          token = await getToken();
        }

        if (mounted) {
          if (!token) {
            // Store current path for return after sign in
            if (typeof window !== 'undefined' && window.location.pathname !== '/' && !window.location.pathname.startsWith('/sign-in')) {
              sessionStorage.setItem('returnUrl', window.location.pathname);
            }
            router.push('/sign-in');
            return;
          }

          // Verify user matches with retry for mobile
          if (user.id !== initialUser.id) {
            if (isMobile) {
              // On mobile, try one more token refresh before redirecting
              try {
                const refreshedToken = await getToken();
                if (refreshedToken && user.id === initialUser.id) {
                  setIsValidated(true);
                  return;
                }
              } catch (e) {
                console.warn('Mobile user verification failed:', e);
              }
            }

            console.warn('User mismatch, redirecting to sign in');
            if (typeof window !== 'undefined' && window.location.pathname !== '/' && !window.location.pathname.startsWith('/sign-in')) {
              sessionStorage.setItem('returnUrl', window.location.pathname);
            }
            router.push('/sign-in');
            return;
          }

          setIsValidated(true);
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        if (mounted) {
          // Store return URL before redirecting
          if (typeof window !== 'undefined' && window.location.pathname !== '/' && !window.location.pathname.startsWith('/sign-in')) {
            sessionStorage.setItem('returnUrl', window.location.pathname);
          }
          router.push('/sign-in');
        }
      }
    };

    validateSession();

    return () => {
      mounted = false;
    };
  }, [isLoaded, user, initialUser.id, router, getToken]);

  // Only show skeleton after a delay if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded || !isValidated) {
        setShouldShowSkeleton(true);
      }
    }, 200); // Small delay to prevent flash

    return () => clearTimeout(timer);
  }, [isLoaded, isValidated]);

  // Show nothing during initial load to prevent flash
  if (!isLoaded || !isValidated) {
    if (!shouldShowSkeleton) {
      return null;
    }
    return layoutType === "main" ? (
      <MainLayout>
        <LoadingSkeleton />
      </MainLayout>
    ) : (
      <SubLayout title={title || ""}>
        <LoadingSkeleton />
      </SubLayout>
    );
  }

  return layoutType === "main" ? (
    <MainLayout>
      {children}
    </MainLayout>
  ) : (
    <SubLayout title={title || ""}>
      {children}
    </SubLayout>
  );
} 
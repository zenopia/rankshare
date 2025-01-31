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
          return;
        }

        const token = await getToken();
        
        if (mounted) {
          if (!token) {
            // If no valid token, redirect to sign in
            router.push('/sign-in');
            return;
          }

          // Verify user matches
          if (user.id !== initialUser.id) {
            console.warn('User mismatch, redirecting to sign in');
            router.push('/sign-in');
            return;
          }

          setIsValidated(true);
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        if (mounted) {
          router.push('/sign-in');
        }
      }
    };

    validateSession();

    return () => {
      mounted = false;
    };
  }, [isLoaded, user, getToken, router, initialUser.id]);

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
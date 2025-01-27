"use client";

import { useEffect } from "react";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { MainLayout } from "@/components/layout/main-layout";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady, isSignedIn } = useAuthGuard({ protected: true });
  const router = useRouter();

  useEffect(() => {
    // If auth check is complete and user is not signed in, redirect to sign in
    if (isReady && !isSignedIn) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/sign-in?returnUrl=${returnUrl}`);
    }
  }, [isReady, isSignedIn, router]);

  // Show loading state while checking auth
  if (!isReady || !isSignedIn) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return <>{children}</>;
} 
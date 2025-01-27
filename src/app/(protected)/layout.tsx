"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import { MainLayout } from "@/components/layout/main-layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady } = useAuthGuard({ protected: true });

  if (!isReady) {
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
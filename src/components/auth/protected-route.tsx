"use client";

import { useAuthGuard } from '@/hooks/use-auth-guard';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isReady } = useAuthGuard({ protected: true });

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
 
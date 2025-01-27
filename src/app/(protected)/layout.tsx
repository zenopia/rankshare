"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isReady } = useAuthGuard({ protected: true });

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
} 
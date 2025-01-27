"use client";

import { usePathname } from "next/navigation";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { BottomNav } from "./bottom-nav";

export function ConditionalBottomNav() {
  const pathname = usePathname();
  const { isSignedIn } = useAuthGuard({ protected: false });

  // Don't show bottom nav on auth pages
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return null;
  }

  return <BottomNav showProfile={isSignedIn} />;
} 
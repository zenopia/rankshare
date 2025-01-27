"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export function UserNav() {
  const { isSignedIn, isLoaded } = useAuthGuard({ protected: false });

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <Button asChild variant="outline">
        <Link href="/sign-in">Sign In</Link>
      </Button>
    );
  }

  return null;
} 
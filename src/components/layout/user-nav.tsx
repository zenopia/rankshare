"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
 
export function UserNav() {
  const { isSignedIn, isLoaded } = useAuth();

  // Don't render anything until auth is loaded
  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <Link href={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}>
          <button className="text-sm font-medium">
            Sign In
          </button>
        </Link>
        <Link href={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}>
          <button className="text-sm font-medium">
            Sign Up
          </button>
        </Link>
      </div>
    );
  }

  return null;
} 
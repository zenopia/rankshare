"use client";

import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
 
export function UserNav() {
  const { isSignedIn } = useAuth();

  return (
    <div className="flex items-center gap-4">
      {isSignedIn ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <>
          <Link href="/sign-in">
            <button className="text-sm font-medium">
              Sign In
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="text-sm font-medium">
              Sign Up
            </button>
          </Link>
        </>
      )}
    </div>
  );
} 
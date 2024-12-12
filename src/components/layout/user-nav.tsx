"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
 
export function UserNav() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return null;

  return (
    <div className="flex items-center gap-4">
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
    </div>
  );
} 
"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
 
export function UserNav() {
  const { isSignedIn, isLoaded } = useAuth();

  // Don't render anything until auth is loaded
  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <nav className="flex items-center space-x-4">
        <Button 
          className="bg-[#801CCC] hover:bg-[#801CCC]/90 text-white"
          asChild
        >
          <Link href="/sign-in">
            Sign In
          </Link>
        </Button>
      </nav>
    );
  }

  return null;
} 
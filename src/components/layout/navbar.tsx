"use client";

import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { isSignedIn } = useAuth();

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background", className)}>
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-bold">
          Curate
        </Link>
        <div className="flex items-center gap-4">
          {!isSignedIn && (
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
          <div className="hidden sm:block">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/search" aria-label="Search">
                <Search className="h-5 w-5" />
              </Link>
            </Button>
          </div>
          <MobileNav />
        </div>
      </div>
    </header>
  );
} 
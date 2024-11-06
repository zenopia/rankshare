"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { NavItem } from "@/types/nav";

const navItems: NavItem[] = [
  {
    title: "Search",
    href: "/search",
    public: true,
  },
  {
    title: "Create List",
    href: "/lists/create",
    public: false,
  },
];

export function Navbar({ className }: { className?: string }) {
  const { isSignedIn } = useAuth();

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background", className)}>
      <nav className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="font-bold">
            RankShare
          </Link>

          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-6">
              {navItems.map((item) => 
                (item.public || isSignedIn) && (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-foreground/80"
                  >
                    {item.title}
                  </Link>
                )
              )}
            </div>

            {/* Auth Button */}
            <div className="flex items-center">
              {isSignedIn ? (
                <UserButton afterSignOutUrl="/" />
              ) : (
                <Button asChild variant="default">
                  <Link href="/sign-in">
                    Sign In
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
      </nav>
    </header>
  );
} 
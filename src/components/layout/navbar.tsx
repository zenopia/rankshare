"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { MobileNav } from "./mobile-nav";

const navItems = [
  {
    href: "/search",
    label: "Search",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
  },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2">
          <SignedIn>
            <MobileNav />
          </SignedIn>
          <Link href="/" className="font-bold">
            RankShare
          </Link>
        </div>

        <SignedIn>
          <div className="ml-8 hidden md:flex" role="navigation" aria-label="Desktop navigation">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                aria-label={label}
              >
                {label}
              </Link>
            ))}
          </div>
        </SignedIn>

        <div className="ml-auto flex items-center space-x-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              aria-label="Sign in"
            >
              Sign In
            </Link>
          </SignedOut>
          
          <SignedIn>
            <Link
              href="/lists/create"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              aria-label="Create new list"
            >
              Create List
            </Link>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
} 
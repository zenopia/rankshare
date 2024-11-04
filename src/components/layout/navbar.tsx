"use client";

import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle,
  SheetDescription 
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

const navItems = [
  { href: "/search", label: "Discover" },
];

export function Navbar() {
  return (
    <nav className="border-b bg-background" role="navigation" aria-label="Main">
      <div className="container flex h-16 items-center px-4">
        <SignedIn>
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-full sm:max-w-none">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Access your lists, saved items, and account settings
              </SheetDescription>
              <Sidebar isMobile />
            </SheetContent>
          </Sheet>
        </SignedIn>

        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="text-2xl font-bold text-foreground hover:text-primary/90"
            aria-label="RankShare home"
          >
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
    </nav>
  );
} 
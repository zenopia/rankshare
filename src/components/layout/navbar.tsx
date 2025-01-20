"use client";

import Link from "next/link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserNav } from "@/components/layout/user-nav";
import { usePathname } from "next/navigation";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Navbar() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    switch (pathname) {
      case '/search':
        return 'Search';
      case '/dashboard':
        return 'Dashboard';
      case '/following':
      case '/followers':
        return 'People';
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <MobileNav />
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2",
                  pathname === "/" && "bg-accent"
                )}
                asChild
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2",
                  pathname === "/search" && "bg-accent"
                )}
                asChild
              >
                <Link href="/search">
                  <Search className="h-4 w-4" />
                  Search
                </Link>
              </Button>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            {getPageTitle() ? (
              <h1 className="text-xl font-semibold">
                {getPageTitle()}
              </h1>
            ) : (
              <Image
                src="/Favely-logo.svg"
                alt="Favely"
                width={100}
                height={50}
                priority
              />
            )}
          </div>

          <div className="flex items-center">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
} 
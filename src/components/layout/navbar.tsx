"use client";

import { MobileNav } from "@/components/layout/mobile-nav";
import { UserNav } from "@/components/layout/user-nav";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface NavbarProps {
  title?: {
    text: string;
    subtext?: string;
  };
}

function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>
    </header>
  );
}

export function Navbar({ title }: NavbarProps) {
  const pathname = usePathname();
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);
  
  // Only show skeleton after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldShowSkeleton(true);
    }, 200); // Small delay to prevent flash

    return () => clearTimeout(timer);
  }, []);

  const getPageTitle = () => {
    if (pathname.startsWith('/search')) {
      return 'Search';
    }
    
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/following':
      case '/followers':
        return 'People';
      default:
        return null;
    }
  };

  // Show skeleton during initial load
  if (shouldShowSkeleton) {
    return <NavbarSkeleton />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <MobileNav />
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            {title ? (
              <div className="text-center">
                <h1 className="text-xl font-semibold leading-tight">
                  {title.text}
                </h1>
                {title.subtext && (
                  <p className="text-sm text-muted-foreground leading-tight">
                    {title.subtext}
                  </p>
                )}
              </div>
            ) : getPageTitle() ? (
              <h1 className="text-xl font-semibold">
                {getPageTitle()}
              </h1>
            ) : (
              <Image
                src="/Favely-logo.svg"
                alt="Favely"
                className="h-[30px] w-[120px]"
                width={120}
                height={30}
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
"use client";

import React from 'react';
import { MobileNav } from "@/components/layout/nav/mobile-nav";
import { UserNav } from "@/components/layout/nav/user-nav";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  title?: {
    text: string;
    subtext?: string;
  };
}

export function Navbar({ title }: NavbarProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith('/search')) {
      return 'Search';
    }
    
    if (pathname.startsWith('/profile/lists')) {
      if (pathname.includes('/create')) return 'Create List';
      if (pathname.includes('/edit')) return 'Edit List';
      return null; // Return null to show logo
    }
    
    switch (pathname) {
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
              <Link href="/">
                <Image
                  src="/Favely-logo.svg"
                  alt="Favely"
                  className="h-[30px] w-[120px]"
                  width={120}
                  height={30}
                  priority
                />
              </Link>
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
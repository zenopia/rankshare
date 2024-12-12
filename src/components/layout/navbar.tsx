"use client";

import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background", className)}>
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="font-bold">
          Curate
        </Link>
        <MobileNav />
      </div>
    </header>
  );
} 
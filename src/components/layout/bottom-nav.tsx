"use client";

import { Home, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background sm:hidden">
      <div className="grid grid-cols-2">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center py-3",
            "transition-colors relative",
            pathname === "/" ? [
              "text-primary",
              "after:absolute after:bottom-0 after:left-1/2",
              "after:h-0.5 after:w-12 after:-translate-x-1/2",
              "after:bg-primary after:rounded-full"
            ] : "text-muted-foreground"
          )}
        >
          <Home className={cn(
            "h-5 w-5 transition-transform",
            pathname === "/" && "scale-110"
          )} />
          <span className="mt-1 text-xs font-medium">Home</span>
        </Link>
        <Link
          href="/search"
          className={cn(
            "flex flex-col items-center justify-center py-3",
            "transition-colors relative",
            pathname === "/search" ? [
              "text-primary",
              "after:absolute after:bottom-0 after:left-1/2",
              "after:h-0.5 after:w-12 after:-translate-x-1/2",
              "after:bg-primary after:rounded-full"
            ] : "text-muted-foreground"
          )}
        >
          <Search className={cn(
            "h-5 w-5 transition-transform",
            pathname === "/search" && "scale-110"
          )} />
          <span className="mt-1 text-xs font-medium">Search</span>
        </Link>
      </div>
    </div>
  );
} 
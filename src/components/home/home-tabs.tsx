"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

export function HomeTabs() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  
  return (
    <div className="border-b bg-background">
      <div className="px-4 md:px-6 lg:px-8">
        <nav 
          className="flex w-full -mb-px" 
          aria-label="Tabs"
        >
          <Link
            href="/"
            className={cn(
              "flex-1 px-3 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap text-center",
              pathname === "/" 
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            Latest
          </Link>
          <Link
            href="/pinned"
            className={cn(
              "flex-1 px-3 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap text-center",
              pathname === "/pinned"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            Pinned
          </Link>
          {isSignedIn && (
            <Link
              href="/my-lists"
              className={cn(
                "flex-1 px-3 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap text-center",
                pathname === "/my-lists"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              My Lists
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
} 
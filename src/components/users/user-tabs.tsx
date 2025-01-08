"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function UserTabs() {
  const pathname = usePathname();
  
  return (
    <div className="border-b bg-background">
      <div className="px-4 md:px-6 lg:px-8">
        <nav 
          className="flex w-full -mb-px" 
          aria-label="Tabs"
        >
          <Link
            href="/following"
            className={cn(
              "flex-1 px-3 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap text-center",
              pathname === "/following"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            Following
          </Link>
          <Link
            href="/followers"
            className={cn(
              "flex-1 px-3 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap text-center",
              pathname === "/followers"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            Followers
          </Link>
        </nav>
      </div>
    </div>
  );
} 
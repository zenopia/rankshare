"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function SearchTabs() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'lists';
  
  return (
    <div className="border-b bg-background">
      <div className="px-4 md:px-6 lg:px-8">
        <nav 
          className="flex w-full -mb-px" 
          aria-label="Tabs"
        >
          <Link
            href={{ pathname: '/search', query: { tab: 'lists' } }}
            className={cn(
              "flex-1 px-3 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap text-center",
              currentTab === 'lists'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            Lists
          </Link>
          <Link
            href={{ pathname: '/search', query: { tab: 'people' } }}
            className={cn(
              "flex-1 px-3 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap text-center",
              currentTab === 'people'
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            People
          </Link>
        </nav>
      </div>
    </div>
  );
} 
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export function SearchTabs() {
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab") || "lists";
  
  // Preserve existing search params when switching tabs
  const params = new URLSearchParams(searchParams?.toString());
  params.delete("tab"); // Remove tab before creating new URLs
  const queryString = params.toString();
  const baseQuery = queryString ? `?${queryString}&` : "?";

  return (
    <div className="border-b mb-6">
      <div className="flex w-full">
        <Link
          href={`/search${baseQuery}tab=lists`}
          className={cn(
            "flex-1 flex items-center justify-center px-6 py-4",
            "text-sm font-medium transition-colors relative",
            "hover:text-foreground hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
            currentTab === "lists" ? [
              "text-foreground",
              "after:absolute after:bottom-0 after:left-0 after:right-0",
              "after:h-[2px] after:bg-primary",
              "bg-muted/50"
            ] : "text-muted-foreground"
          )}
        >
          Lists
        </Link>
        <Link
          href={`/search${baseQuery}tab=people`}
          className={cn(
            "flex-1 flex items-center justify-center px-6 py-4",
            "text-sm font-medium transition-colors relative",
            "hover:text-foreground hover:bg-muted/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring",
            currentTab === "people" ? [
              "text-foreground",
              "after:absolute after:bottom-0 after:left-0 after:right-0",
              "after:h-[2px] after:bg-primary",
              "bg-muted/50"
            ] : "text-muted-foreground"
          )}
        >
          People
        </Link>
      </div>
    </div>
  );
} 
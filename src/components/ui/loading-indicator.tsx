"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
  size?: number;
}

export function LoadingIndicator({
  className,
  size = 16,
}: LoadingIndicatorProps) {
  return (
    <Loader2
      className={cn("animate-spin text-muted-foreground", className)}
      size={size}
    />
  );
}

interface LoadingMoreProps {
  className?: string;
  size?: number;
  text?: string;
}

export function LoadingMore({
  className,
  size = 16,
  text = "Loading more...",
}: LoadingMoreProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground",
        className
      )}
    >
      <LoadingIndicator size={size} />
      <span>{text}</span>
    </div>
  );
} 
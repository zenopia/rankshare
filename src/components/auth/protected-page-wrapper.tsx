"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { SubLayout } from "@/components/layout/sub-layout";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedPageWrapperProps {
  children: React.ReactNode;
  initialUser: {
    id: string;
    username: string | null;
    fullName: string | null;
    imageUrl: string;
  };
  layoutType?: "main" | "sub";
  title?: string;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

export function ProtectedPageWrapper({ 
  children, 
  initialUser: _,
  layoutType = "main",
  title
}: ProtectedPageWrapperProps) {
  const { isLoaded } = useUser();
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);

  // Only show skeleton after a delay if still loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) {
        setShouldShowSkeleton(true);
      }
    }, 200); // Small delay to prevent flash

    return () => clearTimeout(timer);
  }, [isLoaded]);

  // Show nothing during initial load to prevent flash
  if (!isLoaded) {
    if (!shouldShowSkeleton) {
      return null;
    }
    return layoutType === "main" ? (
      <MainLayout>
        <LoadingSkeleton />
      </MainLayout>
    ) : (
      <SubLayout title={title || ""}>
        <LoadingSkeleton />
      </SubLayout>
    );
  }

  return layoutType === "main" ? (
    <MainLayout>
      {children}
    </MainLayout>
  ) : (
    <SubLayout title={title || ""}>
      {children}
    </SubLayout>
  );
} 
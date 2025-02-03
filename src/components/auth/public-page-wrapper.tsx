"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { SubLayout } from "@/components/layout/sub-layout";

interface PublicPageWrapperProps {
  children: React.ReactNode;
  layoutType?: "main" | "sub";
  title?: string;
}

export function PublicPageWrapper({ 
  children, 
  layoutType = "main",
  title
}: PublicPageWrapperProps) {
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
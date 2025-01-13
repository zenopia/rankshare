"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { TabNavigation, type TabItem } from "@/components/ui/tab-navigation";

export function HomeTabs() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  
  const handleProtectedClick = (path: string) => (e: React.MouseEvent) => {
    if (!isSignedIn) {
      e.preventDefault();
      router.push(`/sign-in?return_to=${path}`);
    }
  };

  const tabs: TabItem[] = [
    {
      label: "Latest",
      href: "/",
    },
    {
      label: "Pinned",
      href: "/pinned",
      isProtected: true,
      onProtectedClick: handleProtectedClick('/pinned'),
    },
    {
      label: "My Lists",
      href: "/my-lists",
      isProtected: true,
      onProtectedClick: handleProtectedClick('/my-lists'),
    },
  ];

  return <TabNavigation tabs={tabs} />;
} 
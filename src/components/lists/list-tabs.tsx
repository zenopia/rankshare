"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { TabNavigation, type TabItem } from "@/components/ui/tab-navigation";

export function ListTabs() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const handleProtectedClick = (_path: string) => (e: React.MouseEvent) => {
    if (!isSignedIn) {
      e.preventDefault();
      sessionStorage.setItem('returnTo', pathname);
      router.push('/sign-in');
    }
  };

  const tabs: TabItem[] = [
    {
      label: "Discover",
      href: "/",
      value: "/",
    },
    {
      label: "Pinned",
      href: "/pinned",
      value: "/pinned",
      isProtected: true,
      onProtectedClick: handleProtectedClick('/pinned'),
    },
    {
      label: "My Lists",
      href: "/my-lists",
      value: "/my-lists",
      isProtected: true,
      onProtectedClick: handleProtectedClick('/my-lists'),
    },
    {
      label: "Collab",
      href: "/collab",
      value: "/collab",
      isProtected: true,
      onProtectedClick: handleProtectedClick('/collab'),
    },
  ];

  return <TabNavigation tabs={tabs} />;
} 
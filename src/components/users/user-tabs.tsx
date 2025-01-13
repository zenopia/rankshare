"use client";

import { TabNavigation, type TabItem } from "@/components/ui/tab-navigation";

export function UserTabs() {
  const tabs: TabItem[] = [
    {
      label: "Following",
      href: "/following",
    },
    {
      label: "Followers",
      href: "/followers",
    },
  ];

  return <TabNavigation tabs={tabs} />;
} 
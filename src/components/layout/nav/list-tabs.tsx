"use client";

import { TabNavigation, type TabItem } from "@/components/ui/tab-navigation";

export function ListTabs() {
  const tabs: TabItem[] = [
    {
      label: "My Lists",
      href: "/profile/lists",
      value: "/profile/lists",
    },
    {
      label: "Pinned",
      href: "/profile/lists/pinned",
      value: "/profile/lists/pinned",
    },
    {
      label: "Collab",
      href: "/profile/lists/collab",
      value: "/profile/lists/collab",
    },
  ];

  return <TabNavigation tabs={tabs} />;
} 
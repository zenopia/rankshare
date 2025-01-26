"use client";

import { TabNavigation, type TabItem } from "@/components/ui/tab-navigation";

export function ListTabs() {
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
    },
    {
      label: "My Lists",
      href: "/my-lists",
      value: "/my-lists",
    },
    {
      label: "Collab",
      href: "/collab",
      value: "/collab",
    },
  ];

  return <TabNavigation tabs={tabs} />;
} 
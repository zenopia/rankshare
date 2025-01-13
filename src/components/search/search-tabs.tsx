"use client";

import { TabNavigation, type TabItem } from "@/components/ui/tab-navigation";

export function SearchTabs() {
  const tabs: TabItem[] = [
    {
      label: "Lists",
      href: "/search?tab=lists",
      value: "lists",
    },
    {
      label: "People",
      href: "/search?tab=people",
      value: "people",
    },
  ];

  return <TabNavigation tabs={tabs} useSearchParam="tab" />;
} 
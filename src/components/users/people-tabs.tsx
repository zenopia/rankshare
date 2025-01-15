"use client";

import { TabNavigation } from "@/components/ui/tab-navigation";

export function PeopleTabs() {
  const tabs = [
    {
      label: "Following",
      href: "/following",
      value: "following",
    },
    {
      label: "Followers",
      href: "/followers",
      value: "followers",
    },
  ];

  return <TabNavigation tabs={tabs} />;
} 
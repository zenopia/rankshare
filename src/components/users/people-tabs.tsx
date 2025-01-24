"use client";

import { TabNavigation } from "@/components/ui/tab-navigation";

interface PeopleTabsProps {
  username: string;
}

export function PeopleTabs({ username }: PeopleTabsProps) {
  const tabs = [
    {
      label: "Following",
      href: `/${username}/following`,
      value: "following",
    },
    {
      label: "Followers",
      href: `/${username}/followers`,
      value: "followers",
    },
  ];

  return <TabNavigation tabs={tabs} />;
} 
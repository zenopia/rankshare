"use client";

import { TabNavigation } from "@/components/ui/tab-navigation";
import { useSearchParams } from "next/navigation";

interface PeopleTabsProps {
  username: string;
  followerCount?: number;
  followingCount?: number;
}

export function PeopleTabs({ username, followerCount, followingCount }: PeopleTabsProps) {
  const searchParams = useSearchParams();
  const fromParam = searchParams.get('from');

  const tabs = [
    {
      label: `Followers${typeof followerCount === 'number' ? ` (${followerCount})` : ''}`,
      href: `/u/${username}/followers${fromParam ? `?from=${fromParam}` : ''}`,
      value: `/u/${username}/followers`
    },
    {
      label: `Following${typeof followingCount === 'number' ? ` (${followingCount})` : ''}`,
      href: `/u/${username}/following${fromParam ? `?from=${fromParam}` : ''}`,
      value: `/u/${username}/following`
    }
  ];

  return (
    <TabNavigation 
      tabs={tabs} 
      useSearchParam={undefined}
    />
  );
} 
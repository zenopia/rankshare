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
  const usernameWithAt = username.startsWith('@') ? username : `@${username}`;

  const tabs = [
    {
      label: `Followers${typeof followerCount === 'number' ? ` (${followerCount})` : ''}`,
      href: `/profile/${username}/followers${fromParam ? `?from=${fromParam}` : ''}`,
      value: `/profile/${username}/followers`
    },
    {
      label: `Following${typeof followingCount === 'number' ? ` (${followingCount})` : ''}`,
      href: `/profile/${username}/following${fromParam ? `?from=${fromParam}` : ''}`,
      value: `/profile/${username}/following`
    }
  ];

  return (
    <TabNavigation 
      tabs={tabs} 
      useSearchParam={undefined}
    />
  );
} 
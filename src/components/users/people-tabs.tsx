"use client";

import { TabNavigation } from "@/components/ui/tab-navigation";
import { useSearchParams, usePathname } from "next/navigation";

interface PeopleTabsProps {
  username: string;
  followerCount?: number;
  followingCount?: number;
}

export function PeopleTabs({ username, followerCount, followingCount }: PeopleTabsProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const fromParam = searchParams.get('from');

  const tabs = [
    {
      label: `Followers${typeof followerCount === 'number' ? ` (${followerCount})` : ''}`,
      href: `/${username}/followers${fromParam ? `?from=${fromParam}` : ''}`,
      value: `/${username}/followers`
    },
    {
      label: `Following${typeof followingCount === 'number' ? ` (${followingCount})` : ''}`,
      href: `/${username}/following${fromParam ? `?from=${fromParam}` : ''}`,
      value: `/${username}/following`
    }
  ];

  return (
    <TabNavigation 
      tabs={tabs} 
      useSearchParam={undefined}
    />
  );
} 
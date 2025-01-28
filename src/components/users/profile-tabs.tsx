"use client";

import Link from "next/link";

interface TabsProps {
  username: string;
  followerCount: number;
  followingCount: number;
  activeTab: 'lists' | 'following' | 'followers';
}

export function Tabs({ username, followerCount, followingCount, activeTab }: TabsProps) {
  const tabs = [
    {
      label: 'Lists',
      href: `/u/${username}/lists`,
      active: activeTab === 'lists'
    },
    {
      label: `${followingCount} Following`,
      href: `/u/${username}/following`,
      active: activeTab === 'following'
    },
    {
      label: `${followerCount} Followers`,
      href: `/u/${username}/followers`,
      active: activeTab === 'followers'
    }
  ];

  return (
    <div className="border-b">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`
              border-b-2 py-4 px-1 text-sm font-medium
              ${tab.active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground'
              }
            `}
            aria-current={tab.active ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
} 
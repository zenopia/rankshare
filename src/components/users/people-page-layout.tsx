"use client";

import { useUser } from "@clerk/nextjs";
import type { EnhancedUser } from "@/lib/actions/users";
import { MainLayout } from "@/components/layout/main-layout";
import { SubLayout } from "@/components/layout/sub-layout";
import { PeopleTabs } from "@/components/users/people-tabs";
import { SearchInput } from "@/components/search/search-input";
import { UserList } from "@/components/users/user-list";

interface PeoplePageLayoutProps {
  profileUserId: string;
  displayName: string;
  username: string;
  followerCount: number;
  followingCount: number;
  users: EnhancedUser[];
  searchQuery?: string;
}

export function PeoplePageLayout({
  profileUserId,
  displayName,
  username,
  followerCount,
  followingCount,
  users,
  searchQuery
}: PeoplePageLayoutProps) {
  const { user } = useUser();
  const isOwnProfile = user?.id === profileUserId;

  const PageContent = (
    <div className="relative">
      <PeopleTabs 
        username={username} 
        followerCount={followerCount} 
        followingCount={followingCount} 
      />
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
        <div className="max-w-7xl mx-auto">
          <SearchInput 
            placeholder="Search people..." 
            defaultValue={searchQuery}
          />
          <UserList users={users} />
        </div>
      </div>
    </div>
  );

  return isOwnProfile ? (
    <MainLayout>
      {PageContent}
    </MainLayout>
  ) : (
    <SubLayout title={displayName}>
      {PageContent}
    </SubLayout>
  );
} 
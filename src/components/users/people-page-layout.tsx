"use client";

import { useUser } from "@clerk/nextjs";
import type { EnhancedUser } from "@/lib/actions/users";
import { MainLayout } from "@/components/layout/main-layout";
import { SubLayout } from "@/components/layout/sub-layout";
import { PeopleTabs } from "@/components/users/people-tabs";
import { SearchInput } from "@/components/search/search-input";
import { UserList } from "@/components/users/user-list";
import { useEffect, useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PeoplePageLayoutProps {
  profileUserId: string;
  displayName: string;
  username: string;
  followerCount: number;
  followingCount: number;
  users: EnhancedUser[];
  searchQuery?: string;
}

function LoadingLayout() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-10 w-full" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
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
  const { user, isLoaded } = useUser();
  const [isOwnProfile, setIsOwnProfile] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded) {
      setIsOwnProfile(user?.id === profileUserId);
    }
  }, [user, isLoaded, profileUserId]);

  const PageContent = (
    <div className="relative">
      <PeopleTabs 
        username={username} 
        followerCount={followerCount} 
        followingCount={followingCount} 
      />
      <div className="px-4 md:px-6 lg:px-8 pt-4 pb-20 sm:pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <SearchInput 
            placeholder="Search people..." 
            defaultValue={searchQuery}
          />
          <Suspense fallback={<LoadingLayout />}>
            <UserList users={users} />
          </Suspense>
        </div>
      </div>
    </div>
  );

  // Show SubLayout by default until we confirm it's the user's own profile
  if (!isLoaded || isOwnProfile === null) {
    return (
      <SubLayout title={displayName}>
        <LoadingLayout />
      </SubLayout>
    );
  }

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
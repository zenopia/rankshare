"use client";

import { useAuth } from "@/contexts/auth.context";
import type { EnhancedUser } from "@/lib/actions/users";
import { PeopleTabs } from "@/components/users/people-tabs";
import { SearchInput } from "@/components/search/search-input";
import { UserList } from "@/components/users/user-list";
import { useEffect, useState } from "react";
import { PublicPageWrapper } from "@/components/auth/public-page-wrapper";

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
  const { user, isLoaded } = useAuth();
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
          <UserList users={users} />
        </div>
      </div>
    </div>
  );

  // Show nothing during initial load to prevent flash
  if (!isLoaded || isOwnProfile === null) {
    return null;
  }

  return (
    <PublicPageWrapper 
      layoutType={isOwnProfile ? "main" : "sub"}
      title={displayName}
    >
      {PageContent}
    </PublicPageWrapper>
  );
} 
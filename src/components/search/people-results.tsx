"use client";

import { UserProfileCard } from "@/components/users/user-profile-card";
import useSWR from "swr";
import type { User } from "@/types/list";
import { useSearchParams } from "next/navigation";

export function PeopleResults() {
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";
  
  const { data: users, isLoading } = useSWR<User[]>(
    `/api/users/search${query ? `?q=${query}` : ''}`
  );

  if (isLoading) return <div>Loading...</div>;
  if (!users?.length) return <div>No results found</div>;

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserProfileCard 
          key={user.clerkId}
          userId={user.clerkId}
          isFollowing={false}
          hideFollow={false}
          listCount={user.listCount}
        />
      ))}
    </div>
  );
} 
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserCard } from "@/components/users/user-card";
import type { User } from "@/types/list";

export function PeopleResults() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setIsLoading(true);
      try {
        const q = searchParams.get("q");
        const response = await fetch(`/api/users/search?q=${q || ''}`);
        if (!response.ok) throw new Error('Failed to fetch results');

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchResults();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No users found matching your search</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {users.map((user) => (
        <UserCard
          key={user.clerkId}
          userId={user.clerkId}
          isFollowing={user.isFollowing ?? false}
          hideFollow={false}
        />
      ))}
    </div>
  );
} 
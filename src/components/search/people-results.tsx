"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserCard } from "@/components/users/user-card";

interface SearchUser {
  _id: string;
  clerkId: string;
  username: string;
  displayName: string;
  bio?: string;
  isFollowing?: boolean;
  imageUrl?: string;
}

export function PeopleResults() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchResults() {
      if (!isMounted) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const q = searchParams.get("q");
        const response = await fetch(`/api/users/search?q=${q || ''}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        
        if (!isMounted) return;
        
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
          console.error('Expected results to be an array:', data);
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error fetching search results:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch results');
        setUsers([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {users.map((user) => (
        <UserCard
          key={user._id}
          username={user.clerkId}
          displayName={user.displayName}
          isFollowing={user.isFollowing ?? false}
        />
      ))}
    </div>
  );
} 
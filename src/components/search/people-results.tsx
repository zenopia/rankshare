"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserCard } from "@/components/users/user-card";
import type { User } from "@/types/user";

interface SearchResponse {
  data: {
    results: User[];
    total: number;
    page: number;
    pageSize: number;
  };
  status: number;
}

export function PeopleResults() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
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

        const data: SearchResponse = await response.json();
        
        if (!isMounted) return;
        
        if (Array.isArray(data.data.results)) {
          setUsers(data.data.results);
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
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
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
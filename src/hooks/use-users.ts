"use client";

import useSWR from "swr";
import type { User } from "@/types/list";

interface UseUsersReturn {
  data: User[] | undefined;
  isLoading: boolean;
  error: any;
}

export function useUsers(searchQuery?: string): UseUsersReturn {
  const { data, error, isLoading } = useSWR<User[]>(
    `/api/users/search${searchQuery ? `?q=${searchQuery}` : ''}`
  );

  return {
    data,
    isLoading,
    error
  };
} 
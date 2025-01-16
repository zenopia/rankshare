"use client";

import useSWR from "swr";

interface UserData {
  id: string;
  username: string;
  displayName: string;
  imageUrl: string | null;
}

interface UseUsersReturn {
  data: UserData[] | undefined;
  isLoading: boolean;
  error: any;
}

const fetcher = (userIds: string[]) => 
  fetch('/api/users/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userIds }),
  }).then(res => res.json());

export function useUsers(userIds?: string[]): UseUsersReturn {
  const { data, error, isLoading } = useSWR<UserData[]>(
    userIds?.length ? userIds : null,
    fetcher
  );

  return {
    data,
    isLoading,
    error
  };
} 
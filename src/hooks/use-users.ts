"use client";

import useSWR from "swr";

interface UserData {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  imageUrl: string | null;
}

interface UseUsersReturn {
  data: UserData[] | undefined;
  isLoading: boolean;
  error: any;
}

const fetcher = async (userIdentifiers: string[]) => {
  // Filter out undefined or empty identifiers
  const validIdentifiers = userIdentifiers.filter(Boolean);
  
  if (validIdentifiers.length === 0) {
    return [];
  }

  // Fetch users from the batch endpoint
  const response = await fetch('/api/users/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userIds: validIdentifiers }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  const users = await response.json();
  
  // Transform the responses to match the expected UserData format
  return users.map((user: any) => ({
    id: user.id,
    username: user.username,
    firstName: user.firstName || null,
    lastName: user.lastName || null,
    displayName: user.displayName || user.username,
    imageUrl: user.imageUrl
  }));
};

export function useUsers(userIdentifiers?: string[]): UseUsersReturn {
  const { data, error, isLoading } = useSWR<UserData[]>(
    userIdentifiers?.length ? userIdentifiers : null,
    fetcher
  );

  return {
    data,
    isLoading,
    error
  };
} 
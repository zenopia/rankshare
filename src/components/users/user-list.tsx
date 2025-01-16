"use client";

import { UserCard } from "@/components/users/user-card";

interface User {
  id: string;
  clerkId: string;
  username: string;
  displayName: string;
  bio?: string;
  isFollowing: boolean;
}

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users found
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
      {users.map((user) => (
        <UserCard
          key={user.id}
          userId={user.clerkId}
          username={user.username}
          isFollowing={user.isFollowing}
        />
      ))}
    </div>
  );
} 
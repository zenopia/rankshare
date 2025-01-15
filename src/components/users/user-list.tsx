"use client";

import { UserCard } from "@/components/users/user-card";

interface User {
  id: string;
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
    <div className="space-y-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          userId={user.id}
          displayName={user.displayName}
          bio={user.bio}
          isFollowing={user.isFollowing}
        />
      ))}
    </div>
  );
} 
"use client";

import { UserCard } from "@/components/users/user-card";
import type { EnhancedUser } from "@/lib/actions/users";

interface UserListProps {
  users: EnhancedUser[];
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
          username={user.username}
          displayName={user.displayName}
          imageUrl={user.imageUrl}
          isFollowing={user.isFollowing}
        />
      ))}
    </div>
  );
} 
"use client";

import { useAuth } from "@/contexts/auth.context";
import { UserProfileBase } from "@/components/users/user-profile-base";

interface SidebarProfileProps {
  collapsed: boolean;
  onClick?: () => void;
}

export function SidebarProfile({ collapsed, onClick }: SidebarProfileProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <UserProfileBase
      username={user.username || ""}
      firstName={user.firstName}
      lastName={user.lastName}
      imageUrl={user.imageUrl}
      variant="compact"
      hideFollow={true}
      linkToProfile={true}
      onClick={onClick}
      className={collapsed ? "justify-center" : ""}
      profilePath={`/profile/${user.username}`}
    />
  );
} 
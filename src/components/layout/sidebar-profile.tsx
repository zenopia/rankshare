"use client";

import { useUser } from "@clerk/nextjs";
import { UserProfileBase } from "@/components/users/user-profile-base";

interface SidebarProfileProps {
  collapsed: boolean;
  onClick?: () => void;
}

export function SidebarProfile({ collapsed, onClick }: SidebarProfileProps) {
  const { user } = useUser();

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
      profilePath={user.username ? `/@${user.username}` : "/profile"}
    />
  );
} 
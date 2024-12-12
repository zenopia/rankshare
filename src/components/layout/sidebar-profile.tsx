"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

interface SidebarProfileProps {
  collapsed: boolean;
  onClick?: () => void;
}

export function SidebarProfile({ collapsed, onClick }: SidebarProfileProps) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <Link 
      href="/profile"
      className="flex items-center gap-3 p-4 border-b transition-colors hover:bg-accent"
      onClick={onClick}
    >
      <UserButton afterSignOutUrl="/" />
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium truncate">
            {user.fullName || user.username}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            @{user.username}
          </span>
        </div>
      )}
    </Link>
  );
} 
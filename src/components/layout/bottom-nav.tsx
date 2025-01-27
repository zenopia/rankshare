"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";

interface BottomNavProps {
  showProfile?: boolean;
}

export function BottomNav({ showProfile }: BottomNavProps) {
  const pathname = usePathname();
  const { user } = useUser();

  // Consider these paths as "home" routes
  const isHomeRoute = ['/', '/pinned', '/my-lists', '/collab'].includes(pathname);
  const isPeopleRoute = pathname.includes('/following') || pathname.includes('/followers');

  // Hide bottom nav on list view pages and profile
  if (pathname.startsWith('/lists/') || pathname === '/profile') {
    return null;
  }

  // Get the people link based on auth status and username
  const getPeopleLink = () => {
    if (!showProfile) return '/sign-in';
    if (!user?.username) return '/profile';
    return `/${user.username}/following`;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:hidden">
      <div className="grid h-full grid-cols-2">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center gap-1 border-t-2",
            isHomeRoute 
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Lists</span>
        </Link>
        <Link
          href={getPeopleLink()}
          className={cn(
            "flex flex-col items-center justify-center gap-1 border-t-2",
            isPeopleRoute
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent"
          )}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs">People</span>
        </Link>
      </div>
    </nav>
  );
} 
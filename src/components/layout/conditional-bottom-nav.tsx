'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConditionalBottomNav() {
  const pathname = usePathname();

  // Consider these paths as "home" routes
  const isHomeRoute = ['/', '/pinned', '/my-lists', '/collab'].includes(pathname);
  const isPeopleRoute = ['/following', '/followers'].includes(pathname);

  // Hide bottom nav on list view pages, profile, and other pages with their own bottom nav
  if (pathname.startsWith('/lists/') || pathname === '/profile') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] sm:hidden">
      <div className="grid h-full grid-cols-3">
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
          href="/following"
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
        <Link
          href="/search"
          className={cn(
            "flex flex-col items-center justify-center gap-1 border-t-2",
            pathname === "/search"
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent"
          )}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs">Search</span>
        </Link>
      </div>
    </nav>
  );
} 
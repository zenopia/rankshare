"use client";

import { MobileNav } from "@/components/layout/mobile-nav";
import { UserNav } from "@/components/layout/user-nav";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { InvitationNotifications } from "@/components/notifications/invitation-notifications";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";

interface NavbarProps {
  title?: {
    text: string;
    subtext?: string;
  };
}

export function Navbar({ title }: NavbarProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith('/search')) {
      return 'Search';
    }
    
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/following':
      case '/followers':
        return 'People';
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <MobileNav />
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2">
            {title ? (
              <div className="text-center">
                <h1 className="text-xl font-semibold leading-tight">
                  {title.text}
                </h1>
                {title.subtext && (
                  <p className="text-sm text-muted-foreground">
                    {title.subtext}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-xl font-semibold">
                {getPageTitle()}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <InvitationNotifications />
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
} 
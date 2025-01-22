"use client";

import { useState } from "react";
import Link from "next/link";
import { Portal } from "@radix-ui/react-portal";
import { 
  Menu,
  Home,
  Search,
  PlusCircle,
  ListChecks,
  CompassIcon,
  Bookmark,
  Users2,
  UserPlus,
  Users,
  MessageSquare,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import type { NavItem } from "@/types/nav";
import { SidebarProfile } from "./sidebar-profile";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

// Additional nav items only for mobile
const mobileOnlyNavItems: NavItem[] = [
  {
    title: "About",
    href: "/about",
    public: true,
    icon: Info,
    description: "About Favely"
  },
  {
    title: "Search",
    href: "/search",
    public: true,
    icon: Search,
    description: "Search for lists"
  },
  {
    title: "Lists",
    href: "/",
    public: true,
    icon: Home,
    description: "Return to homepage"
  },
];

const navItems: NavItem[] = [
  {
    title: "Discover",
    href: "/",
    public: true,
    icon: CompassIcon,
    description: "Discover lists",
    indent: true,
    id: "discover"
  },
  {
    title: "Pinned Lists",
    href: "/pinned",
    public: false,
    icon: Bookmark,
    description: "View your pinned lists",
    indent: true
  },
  {
    title: "My Lists",
    href: "/my-lists",
    public: false,
    icon: ListChecks,
    description: "View your created lists",
    indent: true
  },
  {
    title: "Collab",
    href: "/collab",
    public: false,
    icon: Users2,
    description: "View collaborative lists",
    indent: true
  },
  {
    title: "People",
    href: "/following",
    public: false,
    icon: Users,
    description: "View people",
    id: "people"
  },
  {
    title: "Following",
    href: "/following",
    public: false,
    icon: Users2,
    description: "Users you follow",
    indent: true,
    id: "following"
  },
  {
    title: "Followers",
    href: "/followers",
    public: false,
    icon: UserPlus,
    description: "Users following you",
    indent: true
  },
  {
    title: "Create List",
    href: "/lists/create",
    public: false,
    icon: PlusCircle,
    description: "Create a new list"
  },
];

function FeedbackButton({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  return (
    <Link
      href={`/feedback?from=${encodeURIComponent(currentUrl)}`}
      onClick={onClose}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent text-muted-foreground"
    >
      <MessageSquare className="h-4 w-4" aria-hidden="true" />
      <span>Feedback</span>
    </Link>
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const handleClose = () => setOpen(false);

  const renderNavLink = (item: NavItem, index: number) => {
    const Icon = item.icon;
    return (
      <Link
        key={`${item.href}-${index}`}
        href={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
          item.indent && "ml-4"
        )}
        aria-label={item.description}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <>
      <Button
        variant="ghost"
        className="md:hidden"
        aria-label="Open navigation menu"
        size="icon"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      <Portal>
        {/* Backdrop */}
        <div 
          className={cn(
            "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={handleClose}
          style={{ zIndex: 9999 }}
        />

        {/* Navigation Menu */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 h-full w-[280px] bg-white dark:bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out border-r",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ zIndex: 10000 }}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-left mb-6">
              <Image
                src="/Favely-logo.svg"
                alt="Favely"
                className="h-[30px] w-[120px]"
                width={120}
                height={30}
                priority
              />
            </div>

            {isSignedIn && (
              <>
                <SidebarProfile collapsed={false} onClick={handleClose} />
                <div className="h-px bg-border my-4" />
              </>
            )}

            <nav 
              className="flex flex-col space-y-4 overflow-y-auto flex-1"
              aria-label="Mobile navigation"
            >
              {mobileOnlyNavItems.map((item, index) =>
                (item.public || isSignedIn) && renderNavLink(item, index)
              )}
              {isSignedIn && navItems.map((item, index) => renderNavLink(item, index))}
              
              {!isSignedIn && (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <span>Sign In</span>
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                  >
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Feedback link at bottom */}
            <div className="mt-auto pt-4 border-t">
              <FeedbackButton onClose={() => setOpen(false)} />
            </div>
          </div>
        </div>
      </Portal>
    </>
  );
} 
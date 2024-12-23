"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Menu,
  Home,
  Search,
  PlusCircle,
  ListChecks,
  Bookmark,
  Users2,
  UserPlus,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@clerk/nextjs";
import type { NavItem } from "@/types/nav";
import { SidebarProfile } from "./sidebar-profile";

// Additional nav items only for mobile
const mobileOnlyNavItems: NavItem[] = [
  {
    title: "Home",
    href: "/",
    public: true,
    icon: Home,
    description: "Return to homepage"
  },
  {
    title: "Search",
    href: "/search",
    public: true,
    icon: Search,
    description: "Search for lists"
  },
];

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    public: false,
    icon: LayoutDashboard,
    description: "View your dashboard"
  },
  {
    title: "My Lists",
    href: "/my-lists",
    public: false,
    icon: ListChecks,
    description: "View your created lists"
  },
  {
    title: "Pinned Lists",
    href: "/pinned",
    public: false,
    icon: Bookmark,
    description: "View your pinned lists"
  },
  {
    title: "Following",
    href: "/following",
    public: false,
    icon: Users2,
    description: "Users you follow",
  },
  {
    title: "Followers",
    href: "/followers",
    public: false,
    icon: UserPlus,
    description: "Users following you",
  },
  {
    title: "Create List",
    href: "/lists/create",
    public: false,
    icon: PlusCircle,
    description: "Create a new list"
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const handleClose = () => setOpen(false);

  const renderNavLink = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
        aria-label={item.description}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden"
          aria-label="Open navigation menu"
          size="icon"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="right" 
        className="w-80 pt-10"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>
            Site navigation
          </SheetDescription>
        </SheetHeader>

        {isSignedIn && <SidebarProfile collapsed={false} onClick={handleClose} />}

        <nav 
          className="flex flex-col space-y-4 mt-4"
          aria-label="Mobile navigation"
        >
          {mobileOnlyNavItems.map((item) =>
            (item.public || isSignedIn) && renderNavLink(item)
          )}
          {isSignedIn && navItems.map(renderNavLink)}
          
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
      </SheetContent>
    </Sheet>
  );
} 
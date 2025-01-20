"use client";

import { useState } from "react";
import Link from "next/link";
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
  LayoutDashboard,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription
} from "@/components/ui/sheet";
import { useAuth } from "@clerk/nextjs";
import type { NavItem } from "@/types/nav";
import { SidebarProfile } from "./sidebar-profile";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Additional nav items only for mobile
const mobileOnlyNavItems: NavItem[] = [
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
    title: "Dashboard",
    href: "/dashboard",
    public: false,
    icon: LayoutDashboard,
    description: "View your dashboard"
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
        side="left" 
        className="w-[280px] pt-10 pb-20 data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
          <SheetDescription>Access all areas of the application</SheetDescription>
        </SheetHeader>

        <div className="flex justify-center mb-6">
          <Image
            src="/Favely-logo.svg"
            alt="Favely"
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
          className="flex flex-col space-y-4"
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
      </SheetContent>
    </Sheet>
  );
} 
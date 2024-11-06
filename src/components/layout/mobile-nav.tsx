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
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@clerk/nextjs";
import type { NavItem } from "@/types/nav";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

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
    title: "Dashboard",
    href: "/dashboard",
    public: false,
    icon: LayoutDashboard,
    description: "View your dashboard"
  },
];

const navItems: NavItem[] = [
  {
    title: "Search",
    href: "/search",
    public: true,
    icon: Search,
    description: "Search for lists"
  },
  {
    title: "Create List",
    href: "/lists/create",
    public: false,
    icon: PlusCircle,
    description: "Create a new list"
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
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  // Combine regular nav items with mobile-only items
  const allNavItems = [...mobileOnlyNavItems, ...navItems];

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
        <VisuallyHidden asChild>
          <SheetTitle>Navigation Menu</SheetTitle>
        </VisuallyHidden>
        <nav 
          className="flex flex-col space-y-4"
          aria-label="Mobile navigation"
        >
          {allNavItems.map((item) =>
            (item.public || isSignedIn) && (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
                aria-label={item.description}
              >
                {item.icon && (
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{item.title}</span>
              </Link>
            )
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
} 
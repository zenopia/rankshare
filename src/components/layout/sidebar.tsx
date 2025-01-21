"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  CompassIcon,
  ListChecks,
  BookmarkIcon,
  Users2,
  UserPlus,
  Users,
  PlusCircle,
  ListIcon,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProfile } from "@/components/layout/sidebar-profile";
import type { NavItem } from "@/types/nav";

const menuItems: NavItem[] = [
  {
    title: "Lists",
    href: "/",
    public: true,
    icon: ListIcon,
    description: "All lists",
    id: "lists"
  },
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
    icon: BookmarkIcon,
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
  {
    title: "Feedback",
    href: "/feedback",
    public: true,
    icon: MessageSquare,
    description: "Send us feedback"
  }
];

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        isMobile ? "w-full" : collapsed ? "w-16" : "w-64",
        className
      )}
      role="navigation"
    >
      <div className="flex flex-col h-full">
        {!isMobile && (
          <div className="flex h-14 items-center justify-between px-4 border-b">
            {!collapsed && <span className="text-sm font-semibold">Menu</span>}
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", collapsed && "w-full")}
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-all",
                  collapsed && "rotate-180"
                )}
              />
            </Button>
          </div>
        )}

        <div className="p-4 pb-6 border-b">
          <SidebarProfile collapsed={collapsed} />
        </div>

        <div className="flex-1 space-y-1 p-2 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href === '/feedback' ? `/feedback?from=${encodeURIComponent(currentUrl)}` : item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  item.indent && !collapsed && "ml-4"
                )}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
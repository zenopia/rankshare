"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  LayoutDashboard,
  ListChecks,
  BookmarkIcon,
  Users2,
  UserPlus,
  Home,
  ListOrdered,
  PlusCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProfile } from "@/components/layout/sidebar-profile";

const menuItems = [
  {
    title: "Home",
    icon: Home,
    href: "/",
    description: "Return to homepage",
  },
  {
    title: "Latest",
    icon: ListOrdered,
    href: "/",
    description: "Latest lists",
    indent: true,
  },
  {
    title: "Pinned Lists",
    icon: BookmarkIcon,
    href: "/pinned",
    description: "Lists you've pinned",
    indent: true,
  },
  {
    title: "My Lists",
    icon: ListChecks,
    href: "/my-lists",
    description: "Your created lists",
    indent: true,
  },
  {
    title: "People",
    icon: Users,
    href: "/following",
    description: "View people",
  },
  {
    title: "Following",
    icon: Users2,
    href: "/following",
    description: "Users you follow",
    indent: true,
  },
  {
    title: "Followers",
    icon: UserPlus,
    href: "/followers",
    description: "Users following you",
    indent: true,
  },
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    description: "View your dashboard",
  },
  {
    title: "Create List",
    icon: PlusCircle,
    href: "/lists/create",
    description: "Create a new list",
  },
];

interface SidebarProps {
  className?: string;
  isMobile?: boolean;
}

export function Sidebar({ className, isMobile = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-background transition-all duration-300",
        isMobile ? "w-full" : collapsed ? "w-16" : "w-64",
        className
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {!isMobile && (
        <div className="flex h-14 items-center justify-between border-b px-3">
          {!collapsed && <span className="text-lg font-semibold">Menu</span>}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 w-8 p-0 lg:flex"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand menu" : "Collapse menu"}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        </div>
      )}

      <SidebarProfile collapsed={collapsed} />

      <nav className="flex-1 space-y-1 p-2" aria-label="Sidebar navigation">
        {menuItems.map((item, _index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.title.toLowerCase()}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                (collapsed && !isMobile) && "justify-center",
                (!collapsed && item.indent) && "ml-4"
              )}
              aria-current={isActive ? "page" : undefined}
              role="menuitem"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {(!collapsed || isMobile) && (
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  LayoutDashboard,
  Compass,
  PinIcon,
  ListChecks,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onNavigate?: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "My Lists",
    icon: ListChecks,
    href: "/my-lists",
  },
  {
    title: "Following",
    icon: Users,
    href: "/following",
  },
  {
    title: "Pinned Lists",
    icon: PinIcon,
    href: "/saved",
  },
  {
    title: "Discover",
    icon: Compass,
    href: "/search",
  },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-gray-50/50 transition-all duration-300 h-full",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center border-b px-3 justify-between">
        {!collapsed && <span className="text-lg font-semibold">Menu</span>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto h-8 w-8 p-0 lg:flex hidden"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                pathname === item.href && "bg-gray-100 text-gray-900",
                collapsed && "justify-center"
              )}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 
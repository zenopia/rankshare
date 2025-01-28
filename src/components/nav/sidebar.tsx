"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ListChecks,
  Bookmark,
  Users,
  Settings,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Lists",
    href: (username: string) => `/u/${username}/lists`,
    icon: ListChecks,
  },
  {
    title: "Pinned",
    href: "/pinned",
    icon: Bookmark,
  },
  {
    title: "Collaborations",
    href: "/collaborations",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  if (!user) return null;

  return (
    <nav className="hidden space-y-2 md:flex md:flex-col">
      {items.map((item) => {
        const href = typeof item.href === 'function' ? item.href(user.username!) : item.href;
        return (
          <Button
            key={href}
            variant={pathname === href ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              pathname === href && "bg-muted"
            )}
            asChild
          >
            <Link href={href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
} 
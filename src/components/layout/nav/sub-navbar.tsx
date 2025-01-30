"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/nav/user-nav";
import { useRouter } from "next/navigation";

interface SubNavbarProps {
  title: string;
}

export function SubNavbar({ title }: SubNavbarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <div className="flex items-center w-full gap-3">
          {/* Left: Back Button */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.back()}
            aria-label="Go back"
            className="h-9 w-9 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Title */}
          <h1 className="text-xl font-semibold">
            {title}
          </h1>

          {/* Remaining space */}
          <div className="flex-1">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
} 
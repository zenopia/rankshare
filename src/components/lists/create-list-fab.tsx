"use client";

import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

export function CreateListFAB() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Hide FAB on certain pages
  if (pathname.startsWith('/lists/') || pathname === '/profile') {
    return null;
  }

  const handleClick = () => {
    if (!isSignedIn) {
      router.push('/sign-in?return_to=/lists/create');
    } else {
      router.push('/lists/create');
    }
  };

  return (
    <Button
      onClick={handleClick}
      size="lg"
      className="fixed bottom-20 right-4 z-[60] h-14 px-6 shadow-lg flex items-center gap-2 sm:bottom-8 sm:right-8 fab-button"
    >
      <Plus className="h-5 w-5" />
      <span className="hidden sm:inline">Create List</span>
      <span className="sm:hidden">Create list</span>
    </Button>
  );
} 
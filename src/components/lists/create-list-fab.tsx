"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export function CreateListFAB() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) return null;

  return (
    <Link 
      href="/lists/create"
      className="fixed bottom-20 right-4 z-[60] pointer-events-auto sm:bottom-8 sm:right-8"
    >
      <Button 
        size="lg"
        className="h-14 px-6 shadow-lg flex items-center gap-2"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Create List</span>
        <span className="sm:hidden">Create list</span>
      </Button>
    </Link>
  );
} 
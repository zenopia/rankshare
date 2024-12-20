"use client";

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function StickySearch() {
  const router = useRouter();

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:hidden">
      <Button 
        className="w-full shadow-lg flex items-center gap-2" 
        size="lg"
        onClick={() => router.push("/search")}
      >
        <Search className="h-4 w-4" />
        Search Lists
      </Button>
    </div>
  );
} 
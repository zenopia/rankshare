"use client";

import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EditListFABProps {
  listId: string;
}

export function EditListFAB({ listId }: EditListFABProps) {
  return (
    <Link 
      href={`/lists/${listId}/edit`}
      className="fixed bottom-20 right-4 z-[60] sm:bottom-8 sm:right-8"
    >
      <Button 
        size="lg"
        className="h-14 px-6 shadow-lg flex items-center gap-2 fab-button"
      >
        <Pencil className="h-5 w-5" />
        <span>Edit list</span>
      </Button>
    </Link>
  );
} 
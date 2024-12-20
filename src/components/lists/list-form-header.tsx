"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ListFormHeaderProps {
  mode: 'create' | 'edit';
}

export function ListFormHeader({ mode }: ListFormHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-4 mb-8">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.back()}
        className="rounded-full"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Go back</span>
      </Button>
      <h1 className="text-2xl font-bold">
        {mode === 'edit' ? 'Edit List' : 'Create List'}
      </h1>
    </div>
  );
} 
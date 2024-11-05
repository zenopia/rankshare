"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CopyListButtonProps {
  listId: string;
}

export function CopyListButton({ listId }: CopyListButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}/copy`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error();
      
      const data = await response.json();
      toast.success('List copied successfully');
      
      // Navigate to edit view of the new list
      router.push(`/lists/${data._id}/edit`);
    } catch (error) {
      toast.error('Failed to copy list');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="default"
      className="w-10 h-10 p-0"
      disabled={isLoading}
      onClick={handleClick}
      aria-label="Copy list"
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
} 
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pin, PinOff } from "lucide-react";
import { toast } from "sonner";

interface PinButtonProps {
  listId: string;
  isPinned: boolean;
}

export function PinButton({ listId, isPinned: initialPinned }: PinButtonProps) {
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}/pin`, {
        method: isPinned ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error();

      setIsPinned(!isPinned);
      toast.success(isPinned ? 'List unpinned' : 'List pinned');
    } catch (error) {
      toast.error('Failed to update pin status');
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
      aria-label={isPinned ? 'Unpin list' : 'Pin list'}
    >
      {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
    </Button>
  );
} 
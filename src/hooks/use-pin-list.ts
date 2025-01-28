import { useState } from "react";
import { toast } from "sonner";

interface UsePinListProps {
  listId: string;
  initialIsPinned?: boolean;
  onSuccess?: () => void;
}

export function usePinList({
  listId,
  initialIsPinned = false,
  onSuccess,
}: UsePinListProps) {
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [isLoading, setIsLoading] = useState(false);

  const togglePin = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/lists/${listId}/pin`, {
        method: isPinned ? "DELETE" : "POST",
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      setIsPinned(!isPinned);
      toast.success(isPinned ? "List unpinned" : "List pinned");
      onSuccess?.();
    } catch (error: any) {
      console.error("[TOGGLE_PIN]", error);
      toast.error(error.message || "Something went wrong");
      setIsPinned(isPinned);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isPinned,
    isLoading,
    togglePin,
  };
} 
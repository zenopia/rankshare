import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UseIsListPinnedProps {
  listId: string;
  initialIsPinned?: boolean;
}

export function useIsListPinned({
  listId,
  initialIsPinned = false,
}: UseIsListPinnedProps) {
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIsPinned = async () => {
      try {
        const response = await fetch(`/api/lists/${listId}/pin/check`);

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }

        const data = await response.json();
        setIsPinned(data.isPinned);
      } catch (error: any) {
        console.error("[CHECK_PIN]", error);
        toast.error(error.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    checkIsPinned();
  }, [listId]);

  return {
    isPinned,
    isLoading,
  };
} 
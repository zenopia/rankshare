"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { List } from "@/types/list";

export function usePinnedLists() {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLists = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/lists/pinned");

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setLists(data);
    } catch (error: any) {
      console.error("[PINNED_LISTS]", error);
      toast.error(error.message || "Failed to fetch pinned lists");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  return {
    lists,
    isLoading,
    refetch: fetchLists,
  };
} 
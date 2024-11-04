"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useFollow() {
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = async (userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to follow/unfollow user");
      }

      const data = await response.json();
      toast.success(data.message);
      
      // Refresh the page to update the UI
      window.location.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    toggleFollow,
  };
} 
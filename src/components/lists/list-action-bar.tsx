"use client";

import { Button } from "@/components/ui/button";
import { Share2, Pin, Copy, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

interface ListActionBarProps {
  listId: string;
  isPinned: boolean;
  canManageCollaborators?: boolean;
  onPinChange?: (isPinned: boolean) => void;
  onCollaboratorsClick?: () => void;
}

export default function ListActionBar({ 
  listId, 
  isPinned, 
  canManageCollaborators,
  onPinChange,
  onCollaboratorsClick 
}: ListActionBarProps) {
  const [isPinning, setIsPinning] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const router = useRouter();

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("List URL copied to clipboard");
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast.error("Failed to copy URL to clipboard");
    }
  };

  const handlePin = async () => {
    try {
      setIsPinning(true);
      const method = isPinned ? "DELETE" : "POST";
      const response = await fetch(`/api/lists/${listId}/pin`, {
        method,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update pin");
      }

      onPinChange?.(!isPinned);
      toast.success(isPinned ? "List unpinned" : "List pinned");
    } catch (error) {
      console.error("Failed to update pin:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update pin");
    } finally {
      setIsPinning(false);
    }
  };

  const handleCopy = async () => {
    try {
      setIsCopying(true);
      const response = await fetch(`/api/lists/${listId}/copy`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to copy list");
      }

      const data = await response.json();
      toast.success("List copied successfully");
      router.push(`/lists/${data.id}/edit`);
    } catch (error) {
      console.error("Failed to copy list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to copy list");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handleShare}
        title="Share list"
      >
        <Share2 className="h-4 w-4" />
      </Button>
      <Button
        variant={isPinned ? "default" : "outline"}
        size="icon"
        onClick={handlePin}
        disabled={isPinning}
        title={isPinned ? "Unpin list" : "Pin list"}
      >
        <Pin className={`h-4 w-4 ${isPinned ? "fill-current" : ""}`} />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={handleCopy}
        disabled={isCopying}
        title="Copy list"
      >
        <Copy className="h-4 w-4" />
      </Button>
      {canManageCollaborators && (
        <Button
          variant="outline"
          size="icon"
          onClick={onCollaboratorsClick}
          title="Manage collaborators"
        >
          <Users className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
} 
"use client";

import { Button } from "@/components/ui/button";
import { Share2, Pin, PinOff, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ListActionBarProps {
  listId: string;
  isPinned?: boolean;
}

export function ListActionBar({ listId, isPinned = false }: ListActionBarProps) {
  const [isPinning, setIsPinning] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const router = useRouter();

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const togglePin = async () => {
    try {
      setIsPinning(true);
      const response = await fetch(`/api/lists/${listId}/pin`, {
        method: isPinned ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error();

      toast.success(isPinned ? 'List unpinned' : 'List pinned');
      router.refresh();
    } catch (error) {
      toast.error('Failed to update pin status');
    } finally {
      setIsPinning(false);
    }
  };

  const copyList = async () => {
    try {
      setIsCopying(true);
      const response = await fetch(`/api/lists/${listId}/copy`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      toast.success('List copied! Redirecting to edit...');
      router.refresh();
      router.push(`/lists/${data._id}/edit`);
    } catch (error) {
      toast.error('Failed to copy list');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 flex justify-around items-center">
      <Button 
        variant="outline" 
        className="flex-1 mx-2"
        onClick={copyList}
        disabled={isCopying}
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy list
      </Button>
      <Button 
        variant="outline" 
        className="flex-1 mx-2"
        onClick={togglePin}
        disabled={isPinning}
      >
        {isPinned ? (
          <>
            <PinOff className="h-4 w-4 mr-2" />
            Unpin
          </>
        ) : (
          <>
            <Pin className="h-4 w-4 mr-2" />
            Pin
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        className="flex-1 mx-2"
        onClick={copyLink}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  );
} 
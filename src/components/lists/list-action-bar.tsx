"use client";

import { Button } from "@/components/ui/button";
import { Share2, Pin, PinOff, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ListActionBarProps {
  listId: string;
  isPinned: boolean;
  showPinButton?: boolean;
}

function PinListButton({ listId, isPinned }: { listId: string; isPinned: boolean }) {
  const [isPinning, setIsPinning] = useState(false);
  const router = useRouter();

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

  return (
    <Button variant="outline" onClick={togglePin} disabled={isPinning} className="flex-1">
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
  );
}

function CopyListButton({ listId }: { listId: string }) {
  const [isCopying, setIsCopying] = useState(false);
  const router = useRouter();

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
    <Button variant="outline" onClick={copyList} disabled={isCopying} className="flex-1">
      <Copy className="h-4 w-4 mr-2" />
      Copy list
    </Button>
  );
}

function ShareListButton({ listId }: { listId: string }) {
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <Button variant="outline" onClick={copyLink} className="flex-1">
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
}

export function ListActionBar({ listId, isPinned, showPinButton = true }: ListActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      <div className="container max-w-3xl flex gap-2">
        {showPinButton && (
          <PinListButton listId={listId} isPinned={isPinned} />
        )}
        <CopyListButton listId={listId} />
        <ShareListButton listId={listId} />
      </div>
    </div>
  );
} 
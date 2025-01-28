"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";
import { copyList, generateShareLink } from "@/lib/actions/lists";
import { EnhancedList } from "@/types/list";
import { MoreVertical, Share, Copy } from "lucide-react";

interface ListActionsProps {
  list: EnhancedList;
  isOwner: boolean;
  isCollaborator: boolean;
}

export function ListActions({ list, isOwner, isCollaborator }: ListActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    setIsLoading(true);
    try {
      const newList = await copyList(list.id);
      toast({
        title: "List copied",
        description: "A copy of the list has been created",
      });
      // Navigate to the new list
      window.location.href = `/lists/${newList._id}`;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to copy list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const shareUrl = await generateShareLink(list.id);
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate share link",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">More</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(isOwner || isCollaborator) && (
          <>
            <DropdownMenuItem onClick={handleShare} disabled={isLoading}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleCopy} disabled={isLoading}>
          <Copy className="mr-2 h-4 w-4" />
          Make a copy
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
"use client";

import { Button } from "@/components/ui/button";
import { Share, Pin, Users } from "lucide-react";

interface ListActionBarProps {
  listId: string;
  canEdit: boolean;
  isPinned: boolean;
  onCollaboratorsClick: () => void;
}

export function ListActionBar({ listId, canEdit, isPinned, onCollaboratorsClick }: ListActionBarProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {/* TODO: Implement share */}}
      >
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>

      <Button
        variant={isPinned ? "default" : "outline"}
        size="sm"
        onClick={() => {/* TODO: Implement pin */}}
      >
        <Pin className="h-4 w-4 mr-2" />
        {isPinned ? "Pinned" : "Pin"}
      </Button>

      {canEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCollaboratorsClick}
        >
          <Users className="h-4 w-4 mr-2" />
          Collaborators
        </Button>
      )}
    </div>
  );
} 
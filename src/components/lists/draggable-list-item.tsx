"use client";

import { useState } from "react";
import { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import { GripVertical, ArrowUpDown, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItemDetailsOverlay } from "@/components/items/item-details-overlay";
import { ItemDetails } from "@/types/list";

interface DraggableListItemProps {
  item: {
    id: string;
    title: string;
    comment?: string;
    rank: number;
    properties?: Array<{
      id: string;
      type?: 'text' | 'link';
      label: string;
      value: string;
    }>;
  };
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  onUpdate: (updates: Partial<{
    title: string;
    comment?: string;
    rank: number;
    properties?: Array<{
      id: string;
      type?: 'text' | 'link';
      label: string;
      value: string;
    }>;
  }>) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function DraggableListItem({
  item,
  dragHandleProps,
  onUpdate,
  onRemove,
  disabled
}: DraggableListItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDetailsUpdate = (details: ItemDetails) => {
    onUpdate({
      title: details.title,
      comment: details.comment,
      properties: details.properties?.map(prop => ({
        id: prop.id || crypto.randomUUID(),
        type: prop.type,
        label: prop.label,
        value: prop.value
      }))
    });
    setShowDetails(false);
  };

  return (
    <>
      <div
        className={`
          relative flex items-stretch rounded-lg border bg-card
          ${isDragging ? 'ring-2 ring-primary' : ''}
        `}
      >
        <div
          {...dragHandleProps}
          className="flex flex-col items-center justify-center sm:hidden bg-muted px-3 rounded-l-lg touch-none"
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
        >
          <span className="text-sm text-muted-foreground">{item.rank}</span>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground mt-1" />
        </div>

        <div className="hidden sm:flex items-center gap-4 p-4">
          <div
            {...dragHandleProps}
            className="touch-none cursor-grab active:cursor-grabbing"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          >
            <GripVertical className="h-6 w-6 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground w-6">{item.rank}</span>
        </div>
        
        <div className="flex-1 p-4">
          <Input
            className="h-12 sm:h-10 transition-colors focus:bg-accent"
            placeholder="Item title"
            value={item.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            disabled={disabled}
          />
          
          {item.comment && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-1">
              {item.comment}
            </p>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 text-primary hover:text-primary/90"
            onClick={() => setShowDetails(true)}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-1" />
            add details
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-12 w-12 sm:h-10 sm:w-10 rounded-none rounded-r-lg hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove item</span>
        </Button>
      </div>

      <ItemDetailsOverlay
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onSave={handleDetailsUpdate}
        initialDetails={{
          title: item.title,
          comment: item.comment,
          properties: item.properties || []
        }}
      />
    </>
  );
} 
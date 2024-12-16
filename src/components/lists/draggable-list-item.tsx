"use client";

import { useState } from "react";
import { DraggableProvided } from "@hello-pangea/dnd";
import { GripVertical, ArrowUpDown, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ItemDetailsOverlay, ItemDetails } from "./item-details-overlay";

interface DraggableListItemProps {
  item: {
    id: string;
    title: string;
    comment?: string;
    link?: string;
  };
  index: number;
  provided: DraggableProvided;
  removeItem: (id: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  updateItem: (index: number, field: keyof ItemDetails, value: string) => void;
}

export function DraggableListItem({
  item,
  index,
  provided,
  removeItem,
  handleKeyDown,
  updateItem
}: DraggableListItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleDetailsUpdate = (details: ItemDetails) => {
    Object.entries(details).forEach(([field, value]) => {
      updateItem(index, field as keyof ItemDetails, value || "");
    });
  };

  return (
    <>
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        className={`
          relative flex items-stretch rounded-lg border bg-card
          ${isDragging ? 'ring-2 ring-primary' : ''}
        `}
      >
        <div
          {...provided.dragHandleProps}
          className="flex flex-col items-center justify-center sm:hidden bg-muted px-3 rounded-l-lg touch-none"
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
        >
          <span className="text-sm text-muted-foreground">{index + 1}</span>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground mt-1" />
        </div>
        
        <div className="hidden sm:flex items-center gap-4 p-4">
          <div
            {...provided.dragHandleProps}
            className="touch-none cursor-grab active:cursor-grabbing"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          >
            <GripVertical className="h-6 w-6 text-muted-foreground" />
          </div>
          <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
        </div>
        
        <div className="flex-1 p-4">
          <Input
            className="h-12 sm:h-10 transition-colors focus:bg-accent"
            placeholder="Item title"
            value={item.title}
            onChange={(e) => updateItem(index, 'title', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
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
          onClick={() => removeItem(item.id)}
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
          link: item.link,
        }}
      />
    </>
  );
} 
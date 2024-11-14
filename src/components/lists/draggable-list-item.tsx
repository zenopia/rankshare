"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { useDrag } from '@use-gesture/react';
import { DraggableProvided } from "@hello-pangea/dnd";
import { GripVertical, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DraggableListItemProps {
  item: { id: string; title: string; comment?: string };
  index: number;
  provided: DraggableProvided;
  removeItem: (id: string) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLInputElement>, index: number) => void;
  updateItem: (index: number, field: 'title' | 'comment', value: string) => void;
}

const getSwipeStyles = (x: number) => ({
  transform: `translateX(${x}px)`,
  transition: x ? 'none' : 'transform 0.2s ease-out',
});

export function DraggableListItem({ 
  item, 
  index, 
  provided, 
  removeItem, 
  handleKeyDown,
  updateItem 
}: DraggableListItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [swipeAmount, setSwipeAmount] = useState(0);

  useEffect(() => {
    // setIsMounted(true); // Removed unused state
  }, []);

  const triggerHapticFeedback = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate(50);
    }
  };

  const bind = useDrag(({ down, movement: [mx], velocity: [vx] }) => {
    const swipeThreshold = vx > 0.5 || Math.abs(mx) > 100;
    
    setSwipeAmount(down ? mx : 0);
    
    if (Math.abs(mx) > 50) {
      triggerHapticFeedback();
    }

    if (!down && swipeThreshold) {
      triggerHapticFeedback();
      removeItem(item.id);
    }
  }, {
    axis: 'x',
    bounds: { left: -200, right: 0 },
  });

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={cn(
        "relative touch-none transition-shadow",
        isDragging && "shadow-lg"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm transition-colors",
          swipeAmount < -50 && "bg-red-50"
        )}
        style={getSwipeStyles(swipeAmount)}
        {...bind()}
      >
        <div
          {...provided.dragHandleProps}
          className="touch-none cursor-grab active:cursor-grabbing hidden sm:flex items-center"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        >
          <GripVertical className="h-6 w-6 text-gray-400" />
        </div>
        
        <span className="text-sm text-gray-500 w-6 sm:hidden">{index + 1}</span>
        
        <div className="grid sm:grid-cols-2 gap-4 flex-1">
          <Input
            className="h-12 sm:h-10 transition-colors focus:bg-blue-50"
            placeholder="Item title"
            value={item.title}
            onChange={(e) => updateItem(index, 'title', e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={handleFocus}
            aria-label={`Item ${index + 1} title`}
          />
          <Input
            className="h-12 sm:h-10 transition-colors focus:bg-blue-50"
            placeholder="Comment (optional)"
            value={item.comment}
            onChange={(e) => updateItem(index, 'comment', e.target.value)}
            onFocus={handleFocus}
            aria-label={`Item ${index + 1} comment`}
          />
        </div>
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden sm:flex hover:bg-red-100 hover:text-red-600 transition-colors"
          onClick={() => {
            triggerHapticFeedback();
            removeItem(item.id);
          }}
          aria-label={`Remove item ${index + 1}`}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      <div 
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 text-sm sm:hidden transition-colors",
          swipeAmount < -50 ? "text-red-500" : "text-gray-400"
        )}
      >
        Swipe left to delete
      </div>
    </div>
  );
} 
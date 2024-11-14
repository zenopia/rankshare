"use client";

import { useState } from "react";
import { useDrag } from '@use-gesture/react';
import { DraggableProvided } from "@hello-pangea/dnd";
import { GripVertical, X, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { KeyboardEvent } from "react";

interface DraggableListItemProps {
  item: { id: string; title: string; comment?: string };
  index: number;
  provided: DraggableProvided;
  removeItem: (id: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
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
          "flex items-stretch gap-2 bg-white rounded-lg shadow-sm transition-colors",
          swipeAmount < -50 && "bg-red-50"
        )}
        style={getSwipeStyles(swipeAmount)}
        {...bind()}
      >
        <div
          {...provided.dragHandleProps}
          className="flex flex-col items-center justify-center sm:hidden bg-gray-50 px-3 rounded-l-lg touch-none"
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
        >
          <span className="text-sm text-gray-500">{index + 1}</span>
          <ArrowUpDown className="h-4 w-4 text-gray-400 mt-1" />
        </div>
        
        <div className="hidden sm:flex items-center gap-4 p-4">
          <div
            {...provided.dragHandleProps}
            className="touch-none cursor-grab active:cursor-grabbing"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
          >
            <GripVertical className="h-6 w-6 text-gray-400" />
          </div>
          <span className="text-sm text-gray-500 w-6">{index + 1}</span>
        </div>
        
        <div className="flex-1 grid sm:grid-cols-2 gap-4 p-4">
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
          className="hidden sm:flex m-4 hover:bg-red-100 hover:text-red-600 transition-colors"
          onClick={() => {
            triggerHapticFeedback();
            removeItem(item.id);
          }}
          aria-label={`Remove item ${index + 1}`}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
} 
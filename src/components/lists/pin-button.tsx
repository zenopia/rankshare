"use client";

import { Button } from "@/components/ui/button";
import { usePinList } from "@/hooks/use-pin-list";
import { useIsListPinned } from "@/hooks/use-is-list-pinned";
import { cn } from "@/lib/utils";
import { BookmarkIcon } from "lucide-react";

interface PinButtonProps {
  listId: string;
  initialIsPinned?: boolean;
  onSuccess?: () => void;
  className?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

export function PinButton({
  listId,
  initialIsPinned,
  onSuccess,
  className,
  variant = "ghost",
  size = "icon",
  showText = false,
}: PinButtonProps) {
  const { isPinned: isPinnedCheck, isLoading: isCheckLoading } = useIsListPinned({
    listId,
    initialIsPinned,
  });

  const { isPinned, isLoading, togglePin } = usePinList({
    listId,
    initialIsPinned: isPinnedCheck,
    onSuccess,
  });

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "group gap-2",
        isPinned && "text-primary hover:text-primary",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        togglePin();
      }}
      disabled={isLoading || isCheckLoading}
    >
      <BookmarkIcon
        className={cn(
          "h-4 w-4 transition-transform group-hover:scale-110",
          isPinned && "fill-current"
        )}
      />
      {showText && (isPinned ? "Unpin" : "Pin")}
    </Button>
  );
} 
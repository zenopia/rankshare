"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ItemDetailsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: ItemDetails) => void;
  initialDetails?: ItemDetails;
}

export interface ItemDetails {
  title: string;
  comment?: string;
  link?: string;
}

export function ItemDetailsOverlay({
  isOpen,
  onClose,
  onSave,
  initialDetails
}: ItemDetailsOverlayProps) {
  const [details, setDetails] = useState<ItemDetails>({
    title: initialDetails?.title || "",
    comment: initialDetails?.comment || "",
    link: initialDetails?.link || "",
  });

  useEffect(() => {
    if (isOpen && initialDetails) {
      setDetails(initialDetails);
    }
  }, [isOpen, initialDetails]);

  const handleSave = () => {
    onSave(details);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[auto] sm:max-w-[500px] sm:mx-auto">
        <SheetHeader>
          <SheetTitle>Item Details</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Item title</Label>
            <Input
              id="title"
              value={details.title}
              onChange={(e) => setDetails(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter item title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={details.comment}
              onChange={(e) => setDetails(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Add a comment..."
              className="min-h-[100px]"
            />
            <div className="text-xs text-muted-foreground text-right">
              {details.comment?.length || 0}/280
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link (https://)</Label>
            <Input
              id="link"
              type="url"
              value={details.link}
              onChange={(e) => setDetails(prev => ({ ...prev, link: e.target.value }))}
              placeholder="https://"
            />
          </div>
        </div>

        <SheetFooter className="sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 
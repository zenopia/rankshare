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
import { Link2, Type, X } from "lucide-react";
import type { ItemDetails, ItemProperty } from "@/types/list";
import { toast } from "sonner";

interface ItemDetailsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: ItemDetails) => void;
  initialDetails?: ItemDetails;
}

export function ItemDetailsOverlay({
  isOpen,
  onClose,
  onSave,
  initialDetails,
}: ItemDetailsOverlayProps) {
  console.log('ItemDetailsOverlay initialDetails:', initialDetails);
  console.log('ItemDetailsOverlay properties:', initialDetails?.properties);

  const [title, setTitle] = useState(initialDetails?.title || "");
  const [comment, setComment] = useState(initialDetails?.comment || "");
  const [properties, setProperties] = useState<ItemProperty[]>(
    initialDetails?.properties || []
  );

  useEffect(() => {
    if (isOpen) {
      console.log('Setting properties in useEffect:', initialDetails?.properties);
      setTitle(initialDetails?.title || "");
      setComment(initialDetails?.comment || "");
      setProperties(initialDetails?.properties || []);
    }
  }, [isOpen, initialDetails]);

  const addProperty = (type: 'text' | 'link') => {
    const newProperty: ItemProperty = {
      id: crypto.randomUUID(),
      type,
      label: '',
      value: ''
    };
    setProperties([...properties, newProperty]);
  };

  const updateProperty = (id: string, field: 'label' | 'value', value: string) => {
    setProperties(properties.map(prop => 
      prop.id === id ? { ...prop, [field]: value } : prop
    ));
  };

  const removeProperty = (id: string) => {
    setProperties(properties.filter(prop => prop.id !== id));
  };

  const handleSave = () => {
    // Filter out properties with empty labels or values
    const validProperties = properties.filter(
      prop => prop.label.trim() && prop.value.trim()
    );
    
    onSave({
      title,
      comment: comment || undefined,
      properties: validProperties.length > 0 ? validProperties : undefined
    });

    toast.success('Item details saved');
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Item Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter item title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Properties</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addProperty('text')}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addProperty('link')}
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {properties.map((property) => (
                <div key={property.id} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Property name"
                      value={property.label}
                      onChange={(e) => updateProperty(property.id, 'label', e.target.value)}
                    />
                    <Input
                      placeholder={property.type === 'link' ? 'https://' : 'Value'}
                      value={property.value}
                      onChange={(e) => updateProperty(property.id, 'value', e.target.value)}
                      type={property.type === 'link' ? 'url' : 'text'}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProperty(property.id)}
                    className="mt-2"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove property</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSave}>Save changes</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
} 
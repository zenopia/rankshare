"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link2, Type, X } from "lucide-react";
import type { ItemDetails, ItemProperty } from "@/types/list";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [title, setTitle] = useState(initialDetails?.title || "");
  const [comment, setComment] = useState(initialDetails?.comment || "");
  const [properties, setProperties] = useState<ItemProperty[]>(
    initialDetails?.properties || []
  );

  useEffect(() => {
    if (isOpen) {
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
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Content */}
      <div 
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-[400px] bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out",
          "border-l",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Item Details</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6">
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

          <div className="pt-6 border-t mt-6">
            <Button onClick={handleSave} className="w-full">Save changes</Button>
          </div>
        </div>
      </div>
    </>
  );
} 
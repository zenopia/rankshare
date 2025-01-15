'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface ItemCardProps {
  title: string;
  comment?: string;
  properties?: Array<{
    type?: 'text' | 'link';
    label: string;
    value: string;
  }>;
  position: number;
}

export function ItemCard({ title, comment, properties, position }: ItemCardProps) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">#{position}</span>
              <h3 className="font-medium">{title}</h3>
            </div>
            {comment && (
              <p className="text-sm text-muted-foreground">{comment}</p>
            )}
          </div>
        </div>

        {properties && properties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {properties.map((prop, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {prop.label}: {prop.value}
                {prop.type === 'link' && (
                  <ExternalLink className="h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
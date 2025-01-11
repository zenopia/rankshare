"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { User } from "@/types/user";

interface LocationDisplayProps {
  user: Partial<User>;
}

export function LocationDisplay({ user }: LocationDisplayProps) {
  if (!user.location || !user.privacySettings?.showLocation) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <span>{user.location}</span>
    </div>
  );
} 
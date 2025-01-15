'use client';

import { useState } from "react";
import { Search, Globe, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isValidEmail } from "@/lib/utils";
import { toast } from "sonner";

interface CollaboratorManagementProps {
  listId: string;
  isOwner: boolean;
  privacy: 'public' | 'private';
  onClose: () => void;
}

export function CollaboratorManagement({ listId, isOwner, privacy, onClose }: CollaboratorManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!isValidEmail(searchTerm)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: searchTerm,
          role: "viewer",
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      toast.success("Invitation sent!");
      setSearchTerm("");
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePrivacy = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          privacy: privacy === "public" ? "private" : "public",
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      toast.success("Privacy updated!");
    } catch (error) {
      toast.error("Failed to update privacy");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-x-4 top-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:max-w-lg w-full bg-background rounded-lg border shadow-lg">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Manage Access</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {isOwner && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {privacy === "public" ? (
                        <Globe className="h-4 w-4" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                      <h3 className="font-medium">
                        {privacy === "public" ? "Public" : "Private"} List
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {privacy === "public"
                        ? "Anyone can view this list"
                        : "Only collaborators can view this list"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePrivacy}
                    disabled={isLoading}
                  >
                    Make {privacy === "public" ? "Private" : "Public"}
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter email to invite"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Button
                  className="w-full"
                  disabled={!searchTerm || isLoading}
                  onClick={handleInvite}
                >
                  Send Invitation
                </Button>
              </div>

              <div className="h-[1px] bg-border" />
            </>
          )}

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {/* TODO: Render collaborators list */}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
} 
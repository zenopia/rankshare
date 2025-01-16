'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Search, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isValidEmail } from "@/lib/utils";
import { toast } from "sonner";
import { CollaboratorCard } from "@/components/users/collaborator-card";

interface Collaborator {
  userId: string;
  username: string;
  role: 'owner' | 'editor' | 'viewer';
}

interface CollaboratorManagementProps {
  listId: string;
  isOwner: boolean;
  privacy: 'public' | 'private';
  onClose: () => void;
}

export function CollaboratorManagement({ 
  listId, 
  isOwner, 
  privacy,
  onClose 
}: CollaboratorManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isLoadingCollaborators, setIsLoadingCollaborators] = useState(true);

  useEffect(() => {
    // Trigger open animation after mount
    requestAnimationFrame(() => {
      setIsOpen(true);
    });
  }, []);

  useEffect(() => {
    const fetchCollaborators = async () => {
      setIsLoadingCollaborators(true);
      try {
        const response = await fetch(`/api/lists/${listId}/collaborators`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        setCollaborators(data);
      } catch (error) {
        toast.error("Failed to load collaborators");
      } finally {
        setIsLoadingCollaborators(false);
      }
    };

    fetchCollaborators();
  }, [listId]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

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

      // Refresh collaborators list
      const updatedResponse = await fetch(`/api/lists/${listId}/collaborators`);
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        setCollaborators(data);
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
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={handleClose}
      />

      {/* Collaborator Sheet */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 w-[400px] bg-background p-6 shadow-lg",
          "border-l transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Manage Access</h2>
              <p className="text-sm text-muted-foreground">
                Control who can access this list.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="space-y-6">
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

                  <div className="space-y-2">
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
                </div>

                <div className="h-[1px] bg-border" />
              </>
            )}

            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4">
                {isLoadingCollaborators ? (
                  // Show loading skeletons
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <CollaboratorCard
                        userId="loading"
                        username="loading"
                        role="viewer"
                        linkToProfile={false}
                      />
                    </div>
                  ))
                ) : (
                  collaborators.map((collaborator) => (
                    <CollaboratorCard
                      key={collaborator.userId}
                      userId={collaborator.userId}
                      username={collaborator.username}
                      role={collaborator.role}
                      linkToProfile={true}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
} 
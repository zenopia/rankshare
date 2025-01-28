"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InviteCollaboratorDialog } from "./invite-collaborator-dialog";
import { PendingInvitations } from "./pending-invitations";
import { ListCollaborator } from "@/types/list";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";

interface CollaboratorsSectionProps {
  listId: string;
  collaborators: ListCollaborator[];
  isOwner: boolean;
}

export function CollaboratorsSection({ listId, collaborators, isOwner }: CollaboratorsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const activeCollaborators = collaborators.filter(c => c.status === "accepted");

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    // TODO: Implement remove collaborator
    toast({
      title: "Not implemented",
      description: "This feature is coming soon",
      variant: "destructive",
    });
  };

  if (!isOwner && activeCollaborators.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Collaborators</CardTitle>
          <CardDescription>
            People with access to this list
          </CardDescription>
        </div>
        {isOwner && (
          <InviteCollaboratorDialog listId={listId} />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeCollaborators.length > 0 ? (
            <div className="space-y-4">
              {activeCollaborators.map((collaborator) => (
                <div
                  key={collaborator.clerkId}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="font-medium">@{collaborator.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {collaborator.role === "editor" ? "Can edit" : "Can view"}
                    </div>
                  </div>
                  {isOwner && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCollaborator(collaborator.clerkId)}
                    >
                      <Icons.userMinus className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              No collaborators yet
            </div>
          )}
        </div>
        {isOwner && <PendingInvitations listId={listId} />}
      </CardContent>
    </Card>
  );
} 
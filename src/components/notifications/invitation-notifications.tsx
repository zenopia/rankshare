"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";
import { getMyPendingInvitations, acceptInvitation, declineInvitation } from "@/lib/actions/invitations";
import { InvitationDocument } from "@/lib/db/models-v2/invitation";
import { Types } from "mongoose";

interface InvitationWithId extends InvitationDocument {
  _id: Types.ObjectId;
}

export function InvitationNotifications() {
  const [invitations, setInvitations] = useState<InvitationWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loadInvitations = async () => {
    try {
      const data = await getMyPendingInvitations() as InvitationWithId[];
      setInvitations(data);
    } catch (error) {
      console.error("Failed to load invitations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleAccept = async (invitationId: string) => {
    setProcessingIds(prev => new Set(prev).add(invitationId));
    try {
      await acceptInvitation(invitationId);
      toast({
        title: "Success",
        description: "You have joined the list as a collaborator",
      });
      await loadInvitations();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
    }
  };

  const handleDecline = async (invitationId: string) => {
    setProcessingIds(prev => new Set(prev).add(invitationId));
    try {
      await declineInvitation(invitationId);
      toast({
        title: "Success",
        description: "Invitation declined",
      });
      await loadInvitations();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to decline invitation",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(invitationId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {invitations.map((invitation) => {
        const isProcessing = processingIds.has(invitation._id.toString());
        return (
          <Card key={invitation._id.toString()}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {invitation.inviterUsername} invited you to collaborate
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Role: {invitation.role}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAccept(invitation._id.toString())}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.check className="mr-2 h-4 w-4" />
                    )}
                    Accept
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDecline(invitation._id.toString())}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.x className="mr-2 h-4 w-4" />
                    )}
                    Decline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 
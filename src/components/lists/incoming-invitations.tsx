"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMyPendingInvitations, acceptInvitation, declineInvitation } from "@/lib/actions/invitations";
import { InvitationDocument } from "@/lib/db/models-v2/invitation";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/components/ui/use-toast";

export function IncomingInvitations() {
  const [invitations, setInvitations] = useState<InvitationDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const loadInvitations = async () => {
    try {
      const data = await getMyPendingInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Failed to load invitations:", error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
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
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          Lists you&apos;ve been invited to collaborate on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => {
            const isProcessing = processingIds.has(invitation._id.toString());
            return (
              <div
                key={invitation._id.toString()}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <div className="font-medium">List Title</div>
                  <div className="text-sm text-muted-foreground">
                    Invited by {invitation.inviterUsername} • {invitation.role}
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
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 
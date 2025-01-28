"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getInvitationsForList } from "@/lib/actions/invitations";
import { InvitationDocument } from "@/lib/db/models-v2/invitation";
import { Icons } from "@/components/ui/icons";
import { Types } from "mongoose";

interface InvitationWithId extends InvitationDocument {
  _id: Types.ObjectId;
}

interface PendingInvitationsProps {
  listId: string;
}

export function PendingInvitations({ listId }: PendingInvitationsProps) {
  const [invitations, setInvitations] = useState<InvitationWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const data = await getInvitationsForList(listId) as InvitationWithId[];
        setInvitations(data);
      } catch (error) {
        console.error("Failed to load invitations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitations();
  }, [listId]);

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
          People you&apos;ve invited to collaborate on this list
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invitations.map((invitation) => (
            <div
              key={invitation._id.toString()}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <div className="font-medium">{invitation.inviteeEmail}</div>
                <div className="text-sm text-muted-foreground">
                  Invited by {invitation.inviterUsername} • {invitation.role}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement resend invitation
                  }}
                >
                  <Icons.redo2 className="mr-2 h-4 w-4" />
                  Resend
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement cancel invitation
                  }}
                >
                  <Icons.x className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserProfileBase } from "@/components/users/user-profile-base";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface PendingCollaboration {
  id: string;
  listId: string;
  listTitle: string;
  owner: {
    clerkId: string;
    username: string;
  };
  role: string;
  status: string;
}

export default function CollaborationsPage() {
  const [pendingCollaborations, setPendingCollaborations] = useState<PendingCollaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPendingCollaborations = async () => {
      try {
        const response = await fetch('/api/collaborations/pending');
        if (!response.ok) throw new Error();
        const data = await response.json();
        setPendingCollaborations(data);
      } catch (error) {
        toast.error("Failed to load pending collaborations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingCollaborations();
  }, []);

  const handleResponse = async (listId: string, accept: boolean) => {
    try {
      const response = await fetch(`/api/lists/${listId}/collaborators/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accept
        })
      });

      if (!response.ok) throw new Error();

      setPendingCollaborations(prev => 
        prev.filter(collab => collab.listId !== listId)
      );

      toast.success(accept ? "Collaboration accepted" : "Collaboration rejected");
    } catch (error) {
      toast.error("Failed to respond to collaboration");
    }
  };

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <h1 className="text-2xl font-bold">Pending Collaborations</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-8 bg-muted rounded w-48" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Pending Collaborations</h1>
      {pendingCollaborations.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground">No pending collaborations</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingCollaborations.map((collab) => (
            <Card key={collab.id} className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <Link 
                    href={`/lists/${collab.listId}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {collab.listTitle}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Invited by</span>
                    <UserProfileBase
                      username={collab.owner.username}
                      variant="compact"
                      hideFollow
                    />
                    <span>as</span>
                    <Badge variant="outline" className="capitalize">
                      {collab.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleResponse(collab.listId, false)}
                  >
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleResponse(collab.listId, true)}
                  >
                    Accept
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
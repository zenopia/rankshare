"use client";

import { useState, useEffect } from "react";
import { ListView } from "@/components/lists/list-view";
import { ListViewNav } from "@/components/layout/nav/list-view-nav";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { EnhancedList } from "@/types/list";
import { ListLayout } from "@/components/layout/list-layout";
import { useProtectedFetch } from "@/hooks/use-protected-fetch";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useUser } from "@clerk/nextjs";

interface ListPageContentProps {
  list: EnhancedList;
  isOwner: boolean;
  isPinned: boolean;
  isFollowing: boolean;
  isCollaborator: boolean;
  returnPath?: string;
  isLoading?: boolean;
  error?: string;
}

export function ListPageContent({
  list,
  isOwner,
  isPinned: initialIsPinned,
  isFollowing: initialIsFollowing,
  isCollaborator: initialIsCollaborator,
  returnPath,
  isLoading: initialIsLoading,
  error: initialError
}: ListPageContentProps) {
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isCollaborator, setIsCollaborator] = useState(initialIsCollaborator);
  const { fetchWithAuth } = useProtectedFetch();
  const { isSignedIn } = useAuthGuard({ protected: false }); // Don't force auth
  const { user } = useUser();

  // Only fetch status if user is signed in
  useEffect(() => {
    const fetchStatus = async () => {
      if (!isSignedIn || !user) return;
      
      try {
        const response = await fetchWithAuth(`/api/lists/${list.id}/status`, {
          requireAuth: false // Don't require auth for public lists
        });
        const data = await response.json();
        setIsPinned(data.isPinned);
        setIsFollowing(data.isFollowing);
        setIsCollaborator(data.isCollaborator);
      } catch (error) {
        console.error('Error fetching list status:', error);
        // Don't show error UI, just keep initial values
      }
    };

    fetchStatus();
  }, [list.id, isSignedIn, user, fetchWithAuth]);

  if (initialIsLoading) {
    return (
      <ListLayout>
        <div className="container px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-[600px]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </ListLayout>
    );
  }

  if (initialError) {
    return (
      <ListLayout>
        <div className="container px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{initialError}</AlertDescription>
          </Alert>
        </div>
      </ListLayout>
    );
  }

  return (
    <ListLayout>
      <div className="flex flex-col min-h-[calc(100vh-64px)]">
        <ListViewNav 
          returnPath={returnPath} 
          title={list.title}
          isOwner={isOwner}
          isCollaborator={isCollaborator}
          showCollaborators={showCollaborators}
          onCollaboratorsClick={() => setShowCollaborators(!showCollaborators)}
          collaborators={list.collaborators}
        />
        <div className="flex-1 container px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 overflow-y-auto">
          <ErrorBoundaryWrapper>
            <ListView
              list={{
                ...list,
                stats: {
                  ...list.stats,
                  pinCount: isPinned ? list.stats.pinCount : list.stats.pinCount - 1
                }
              }}
              isOwner={isOwner}
              isPinned={isPinned}
              isFollowing={isFollowing}
              isCollaborator={isCollaborator}
              showCollaborators={showCollaborators}
              onCollaboratorsClick={() => setShowCollaborators(!showCollaborators)}
            />
          </ErrorBoundaryWrapper>
        </div>
      </div>
    </ListLayout>
  );
} 
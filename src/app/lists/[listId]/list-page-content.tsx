"use client";

import { useState } from "react";
import { ListView } from "@/components/lists/list-view";
import { ListViewNav } from "@/components/layout/nav/list-view-nav";
import { ErrorBoundaryWrapper } from "@/components/error-boundary-wrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { EnhancedList } from "@/types/list";
import { ListLayout } from "@/components/layout/list-layout";

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
  isPinned,
  isFollowing,
  isCollaborator,
  returnPath,
  isLoading,
  error
}: ListPageContentProps) {
  const [showCollaborators, setShowCollaborators] = useState(false);

  if (isLoading) {
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

  if (error) {
    return (
      <ListLayout>
        <div className="container px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
              list={list}
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
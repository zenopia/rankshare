"use client";

import { useState } from "react";
import { List } from "@/types/list";
import { ListView } from "@/components/lists/list-view";
import { ListViewNav } from "@/components/lists/list-view-nav";

interface ListPageContentProps {
  list: List;
  isOwner: boolean;
  isPinned: boolean;
  isFollowing: boolean;
  isCollaborator: boolean;
  returnPath?: string;
}

export function ListPageContent({
  list,
  isOwner,
  isPinned,
  isFollowing,
  returnPath
}: ListPageContentProps) {
  const [showCollaborators, setShowCollaborators] = useState(false);

  return (
    <>
      <ListViewNav 
        returnPath={returnPath} 
        title={list.title}
        isOwner={isOwner}
        showCollaborators={showCollaborators}
        onCollaboratorsClick={() => setShowCollaborators(!showCollaborators)}
      />
      <div className="container py-6">
        <ListView
          list={list}
          isOwner={isOwner}
          isPinned={isPinned}
          isFollowing={isFollowing}
          showCollaborators={showCollaborators}
          onCollaboratorsClick={() => setShowCollaborators(!showCollaborators)}
        />
      </div>
    </>
  );
} 
"use client";

import { ProtectedPageWrapper } from "@/components/auth/protected-page-wrapper";
import { EnhancedList } from "@/types/list";
import { CollabListsContent } from "./collab-lists-content";

interface CollabListsLayoutProps {
  lists: EnhancedList[];
  initialUser: {
    id: string;
    username: string | null;
    fullName: string | null;
    imageUrl: string;
  };
}

export function CollabListsLayout({ lists, initialUser }: CollabListsLayoutProps) {
  return (
    <ProtectedPageWrapper 
      initialUser={initialUser}
      layoutType="main"
      title="Shared Lists"
    >
      <CollabListsContent lists={lists} />
    </ProtectedPageWrapper>
  );
} 
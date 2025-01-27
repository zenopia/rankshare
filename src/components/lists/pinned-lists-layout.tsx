"use client";

import { ProtectedPageWrapper } from "@/components/auth/protected-page-wrapper";
import { EnhancedList } from "@/types/list";
import { PinnedListsContent } from "./pinned-lists-content";

interface PinnedListsLayoutProps {
  lists: EnhancedList[];
  initialUser: {
    id: string;
    username: string | null;
    fullName: string | null;
    imageUrl: string;
  };
}

export function PinnedListsLayout({ lists, initialUser }: PinnedListsLayoutProps) {
  return (
    <ProtectedPageWrapper 
      initialUser={initialUser}
      layoutType="main"
      title="Pinned Lists"
    >
      <PinnedListsContent lists={lists} />
    </ProtectedPageWrapper>
  );
} 
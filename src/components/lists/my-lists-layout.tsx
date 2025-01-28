"use client";

import { ProtectedPageWrapper } from "@/components/auth/protected-page-wrapper";
import { EnhancedList } from "@/types/list";
import { MyListsContent } from "@/components/lists/my-lists-content";

interface MyListsLayoutProps {
  lists: EnhancedList[];
  initialUser: {
    id: string;
    username: string | null;
    fullName: string | null;
    imageUrl: string;
  };
}

export function MyListsLayout({ lists, initialUser }: MyListsLayoutProps) {
  return (
    <ProtectedPageWrapper 
      initialUser={initialUser}
      layoutType="main"
      title="My Lists"
    >
      <MyListsContent lists={lists} />
    </ProtectedPageWrapper>
  );
} 
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEnhancedLists } from "@/lib/actions/lists";
import { MyListsLayout } from "@/components/lists/my-lists-layout";
import { ListCategory } from "@/types/list";

interface PageProps {
  searchParams: {
    q?: string;
    category?: ListCategory;
    sort?: string;
  };
}

export default async function CollaborativeListsPage({ searchParams }: PageProps) {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const [user, { lists: unsortedLists }] = await Promise.all([
      clerkClient.users.getUser(userId),
      getEnhancedLists(
        { 
          'collaborators.clerkId': userId,
          'collaborators.status': 'accepted'
        },
        { lean: true }
      )
    ]);
    
    // Apply sorting
    const sortedLists = [...unsortedLists].sort((a, b) => {
      switch (searchParams.sort) {
        case 'views':
          return (b.stats.viewCount || 0) - (a.stats.viewCount || 0);
        case 'pins':
          return (b.stats.pinCount || 0) - (a.stats.pinCount || 0);
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    return (
      <MyListsLayout 
        lists={sortedLists}
        initialUser={{
          id: user.id,
          username: user.username,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || null,
          imageUrl: user.imageUrl,
        }}
      />
    );
  } catch (error) {
    console.error('Error loading collaborative lists page:', error);
    redirect('/sign-in');
  }
} 
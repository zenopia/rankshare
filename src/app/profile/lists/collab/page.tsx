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
  console.log('Accessing Collaborative Lists Page');
  const { userId } = auth();

  if (!userId) {
    console.log('No user found, redirecting to sign-in');
    redirect('/sign-in');
  }

  try {
    console.log('Fetching data for user:', userId);
    const [user, { lists: unsortedLists }] = await Promise.all([
      clerkClient.users.getUser(userId),
      getEnhancedLists(
        { 
          $or: [
            {
              'collaborators.clerkId': userId,
              'collaborators.status': 'accepted'
            },
            {
              $and: [
                { 'owner.clerkId': userId },
                { collaborators: { $type: 'array', $ne: [] } }
              ]
            }
          ]
        },
        { lean: true }
      )
    ]);
    
    console.log('Found lists:', unsortedLists.length);
    
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

    console.log('Lists after sorting:', sortedLists.length);
    
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
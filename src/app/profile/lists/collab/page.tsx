import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEnhancedLists } from "@/lib/actions/lists";
import { MyListsLayout } from "@/components/lists/my-lists-layout";

export default async function CollaborativeListsPage() {
  const { userId } = auth();

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const [user, { lists }] = await Promise.all([
      clerkClient.users.getUser(userId),
      getEnhancedLists(
        { 
          'collaborators.clerkId': userId,
          'collaborators.status': 'accepted'
        },
        { lean: true }
      )
    ]);
    
    return (
      <MyListsLayout 
        lists={lists}
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
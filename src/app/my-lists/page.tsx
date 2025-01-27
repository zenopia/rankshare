import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEnhancedLists } from "@/lib/actions/lists";
import { MyListsLayout } from "@/components/lists/my-lists-layout";

export default async function MyListsPage() {
  const { userId } = auth();

  // Redirect to sign in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const [user, { lists }] = await Promise.all([
      clerkClient.users.getUser(userId),
      getEnhancedLists({ 'owner.clerkId': userId })
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
    console.error('Error loading my lists page:', error);
    redirect('/sign-in');
  }
} 
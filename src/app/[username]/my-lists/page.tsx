import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getEnhancedLists } from "@/lib/actions/lists";
import { MyListsLayout } from "@/components/lists/my-lists-layout";

export default async function UserMyListsPage({
  params: { username }
}: {
  params: { username: string }
}) {
  const { userId } = auth();

  // Redirect to sign in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    // Get user data
    const user = await clerkClient.users.getUser(userId);
    
    // Verify this is the user's own lists
    const cleanUsername = username.replace(/^@/, '');
    if (user.username !== cleanUsername) {
      redirect('/');
    }

    const { lists } = await getEnhancedLists({ 'owner.clerkId': userId });
    
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
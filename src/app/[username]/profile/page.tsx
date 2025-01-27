import { auth, clerkClient } from "@clerk/nextjs/server";
import { ProfilePage } from "@/components/profile/profile-page";
import { redirect } from "next/navigation";

export default async function UserProfilePage({
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
    
    // Verify this is the user's own profile
    const cleanUsername = username.replace(/^@/, '');
    if (user.username !== cleanUsername) {
      redirect('/');
    }

    return (
      <ProfilePage 
        initialUser={{
          id: user.id,
          username: user.username,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || null,
          imageUrl: user.imageUrl,
        }} 
      />
    );
  } catch (error) {
    console.error('Error loading profile page:', error);
    redirect('/sign-in');
  }
} 
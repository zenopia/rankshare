import { auth, clerkClient } from "@clerk/nextjs/server";
import { ProfilePage } from "@/components/profile/profile-page";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = auth();

  // Redirect to sign in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    
    return <ProfilePage initialUser={{
      id: user.id,
      username: user.username,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || null,
      imageUrl: user.imageUrl,
    }} />;
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    // If we can't fetch the user, redirect to sign in
    redirect('/sign-in');
  }
} 
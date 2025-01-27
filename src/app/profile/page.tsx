import { auth, clerkClient } from "@clerk/nextjs/server";
import { ProfilePage } from "@/components/profile/profile-page";
import { notFound } from "next/navigation";

export default async function Page() {
  const { userId } = auth();

  // Get user data
  let user;
  try {
    if (!userId) {
      notFound();
    }
    user = await clerkClient.users.getUser(userId);
  } catch (error) {
    console.error('Error fetching user from Clerk:', error);
    notFound();
  }

  if (!user) {
    notFound();
  }

  return <ProfilePage initialUser={{
    id: user.id,
    username: user.username,
    fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || null,
    imageUrl: user.imageUrl,
  }} />;
} 
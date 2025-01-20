import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";

export async function checkAuth() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }
  return userId;
}

export async function checkProfile(returnUrl?: string) {
  // Skip profile check if we're already on the profile page
  if (returnUrl === '/profile') {
    return;
  }

  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  await connectToMongoDB();
  const UserModel = await getUserModel();
  const UserProfileModel = await getUserProfileModel();

  const user = await UserModel.findOne({ clerkId: userId });
  if (!user) {
    redirect("/sign-in");
  }

  const profile = await UserProfileModel.findOne({ userId: user._id });
  if (!profile?.profileComplete) {
    redirect(`/profile${returnUrl ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
  }

  return { user, profile };
} 
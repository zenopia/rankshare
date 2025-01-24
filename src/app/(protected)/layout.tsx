import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Get current path
  const headersList = headers();
  const pathname = headersList.get("x-invoke-path") || "";

  // Skip profile check if we're on the profile page
  if (pathname === "/profile") {
    return <>{children}</>;
  }

  // Check if user exists
  await connectToMongoDB();
  const UserModel = await getUserModel();

  const user = await UserModel.findOne({ clerkId: userId });
  if (!user) {
    redirect("/sign-in");
  }

  // No longer checking for profile completion
  return <>{children}</>;
} 
"use server"

import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { MongoUserDocument } from "@/types/mongo";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function getUser(clerkId: string): Promise<MongoUserDocument | null> {
  await connectToDatabase();
  const UserModel = await getUserModel();
  return UserModel.findOne({ clerkId }).lean() as unknown as MongoUserDocument;
}

export async function getFollowersCount(clerkId: string): Promise<number> {
  await connectToDatabase();
  const FollowModel = await getFollowModel();
  return FollowModel.countDocuments({ followingId: clerkId, status: 'accepted' });
}

export async function getFollowingCount(clerkId: string): Promise<number> {
  await connectToDatabase();
  const FollowModel = await getFollowModel();
  return FollowModel.countDocuments({ followerId: clerkId, status: 'accepted' });
}

export async function getFollowStatus(targetUserId: string): Promise<boolean> {
  const { userId } = auth();
  if (!userId) return false;

  await connectToDatabase();
  const FollowModel = await getFollowModel();
  const follow = await FollowModel.findOne({
    followerId: userId,
    followingId: targetUserId,
    status: 'accepted'
  });
  return !!follow;
}

export async function updateUser(clerkId: string, data: Partial<MongoUserDocument>): Promise<void> {
  await connectToDatabase();
  const UserModel = await getUserModel();
  await UserModel.updateOne({ clerkId }, { $set: data });
}

export async function deleteUser(clerkId: string): Promise<void> {
  await connectToDatabase();
  const UserModel = await getUserModel();
  await UserModel.deleteOne({ clerkId });
}

export async function ensureUserExists() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  await connectToDatabase();
  const UserModel = await getUserModel();

  const user = await UserModel.findOne({ clerkId: userId });
  if (!user) {
    // Get user data from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);
    
    // Create new user document
    const newUser = await UserModel.create({
      clerkId: userId,
      username: clerkUser.username || '',
      displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || '',
      searchIndex: `${clerkUser.username || ''} ${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.toLowerCase(),
      followersCount: 0,
      followingCount: 0,
      listCount: 0
    });

    return newUser;
  }

  return user;
} 
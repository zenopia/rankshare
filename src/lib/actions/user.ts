"use server"

import { auth } from "@clerk/nextjs/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { MongoUserDocument } from "@/types/mongo";

export async function getUser(clerkId: string): Promise<MongoUserDocument | null> {
  await connectToMongoDB();
  const UserModel = await getUserModel();
  return UserModel.findOne({ clerkId }).lean() as unknown as MongoUserDocument;
}

export async function getFollowersCount(clerkId: string): Promise<number> {
  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  return FollowModel.countDocuments({ followingId: clerkId, status: 'accepted' });
}

export async function getFollowingCount(clerkId: string): Promise<number> {
  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  return FollowModel.countDocuments({ followerId: clerkId, status: 'accepted' });
}

export async function getFollowStatus(targetUserId: string): Promise<boolean> {
  const { userId } = auth();
  if (!userId) return false;

  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  const follow = await FollowModel.findOne({
    followerId: userId,
    followingId: targetUserId,
    status: 'accepted'
  });
  return !!follow;
}

export async function updateUser(clerkId: string, data: Partial<MongoUserDocument>): Promise<void> {
  await connectToMongoDB();
  const UserModel = await getUserModel();
  await UserModel.updateOne({ clerkId }, { $set: data });
}

export async function deleteUser(clerkId: string): Promise<void> {
  await connectToMongoDB();
  const UserModel = await getUserModel();
  await UserModel.deleteOne({ clerkId });
}

export async function ensureUserExists() {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  await connectToMongoDB();
  const UserModel = await getUserModel();

  const user = await UserModel.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  return user;
} 
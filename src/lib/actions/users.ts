import { auth } from "@clerk/nextjs/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";
import { getUserCacheModel } from "@/lib/db/models-v2/user-cache";
import { MongoUserDocument } from "@/types/mongo";

export interface EnhancedUser {
  id: string;
  clerkId: string;
  username: string;
  displayName: string;
  imageUrl: string | null;
  bio?: string;
  isFollowing: boolean;
}

export async function getEnhancedUsers(filter: any = {}, options: { sort?: any } = {}): Promise<EnhancedUser[]> {
  const { userId } = auth();
  
  await connectToMongoDB();
  
  // Get model instances
  const UserModel = await getUserModel();
  const UserProfileModel = await getUserProfileModel();
  const UserCacheModel = await getUserCacheModel();
  const FollowModel = await getFollowModel();
  
  // Fetch users with the given filter
  const users = await UserModel.find(filter).lean();
  
  // Get user cache data for all users
  const userCaches = await UserCacheModel.find({
    clerkId: { $in: users.map(user => user.clerkId) }
  }).lean();
  
  // Create a map for quick lookup
  const userCacheMap = userCaches.reduce((acc, cache) => {
    acc[cache.clerkId] = cache;
    return acc;
  }, {} as Record<string, any>);
  
  // Get user profiles
  const userProfiles = await UserProfileModel.find({
    userId: { $in: users.map(user => user._id) }
  }).lean();
  
  // Create a map for quick lookup
  const userProfileMap = userProfiles.reduce((acc, profile) => {
    acc[profile.userId.toString()] = profile;
    return acc;
  }, {} as Record<string, any>);
  
  // If authenticated, get follow data
  let followMap: Record<string, boolean> = {};
  if (userId) {
    const follows = await FollowModel.find({
      followerId: userId,
      followingId: { $in: users.map(user => user.clerkId) },
      status: 'accepted'
    }).lean();
    
    followMap = follows.reduce((acc, follow) => {
      acc[follow.followingId] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }
  
  // Enhance users with cache and follow data
  return users.map(user => {
    const cache = userCacheMap[user.clerkId];
    const profile = userProfileMap[user._id.toString()];
    
    return {
      id: user._id.toString(),
      clerkId: user.clerkId,
      username: user.username,
      displayName: cache?.displayName || user.username,
      imageUrl: cache?.imageUrl || null,
      bio: profile?.bio,
      isFollowing: !!followMap[user.clerkId]
    };
  });
} 
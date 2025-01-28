import { auth } from "@clerk/nextjs/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";
import { getUserCacheModel } from "@/lib/db/models-v2/user-cache";
import { MongoUserDocument, MongoUserProfileDocument } from "@/types/mongo";

export interface EnhancedUser {
  id: string;
  clerkId: string;
  username: string;
  displayName: string;
  imageUrl: string | null;
  bio?: string;
  isFollowing: boolean;
}

export interface UserProfile {
  id: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedAt: Date;
}

function transformMongoProfileToUserProfile(profile: MongoUserProfileDocument): UserProfile {
  return {
    id: profile.userId.toString(),
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
    joinedAt: profile.createdAt
  };
}

export async function followUser(followingId: string): Promise<void> {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');
  
  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  
  // Check if already following
  const existingFollow = await FollowModel.findOne({
    followerId: userId,
    followingId,
    status: 'accepted'
  });
  
  if (existingFollow) {
    throw new Error('Already following this user');
  }
  
  // Create new follow
  await FollowModel.create({
    followerId: userId,
    followingId,
    status: 'accepted',
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

export async function unfollowUser(followingId: string): Promise<void> {
  const { userId } = auth();
  if (!userId) throw new Error('Not authenticated');
  
  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  
  // Delete follow relationship
  await FollowModel.deleteOne({
    followerId: userId,
    followingId,
    status: 'accepted'
  });
}

export async function getIsFollowing(followingId: string): Promise<boolean> {
  const { userId } = auth();
  if (!userId) return false;
  
  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  
  const follow = await FollowModel.findOne({
    followerId: userId,
    followingId,
    status: 'accepted'
  });
  
  return !!follow;
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
  const users = await UserModel.find(filter).lean() as unknown as MongoUserDocument[];
  
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

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  await connectToMongoDB();
  const UserProfileModel = await getUserProfileModel();
  
  const profile = await UserProfileModel.findOne({ userId }).lean() as unknown as MongoUserProfileDocument | null;
  if (!profile) return null;
  
  return transformMongoProfileToUserProfile(profile);
}

export async function getFollowers(userId: string): Promise<EnhancedUser[]> {
  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  
  const follows = await FollowModel.find({ 
    followingId: userId,
    status: 'accepted'
  })
  .sort({ createdAt: -1 })
  .lean();
  
  return getEnhancedUsers({
    clerkId: { $in: follows.map(follow => follow.followerId) }
  });
}

export async function getFollowing(userId: string): Promise<EnhancedUser[]> {
  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  
  const follows = await FollowModel.find({ 
    followerId: userId,
    status: 'accepted'
  })
  .sort({ createdAt: -1 })
  .lean();
  
  return getEnhancedUsers({
    clerkId: { $in: follows.map(follow => follow.followingId) }
  });
}

export async function getFollowersCount(userId: string): Promise<number> {
  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  return FollowModel.countDocuments({ 
    followingId: userId,
    status: 'accepted'
  });
}

export async function getFollowingCount(userId: string): Promise<number> {
  await connectToMongoDB();
  const FollowModel = await getFollowModel();
  return FollowModel.countDocuments({ 
    followerId: userId,
    status: 'accepted'
  });
} 
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import type { User as ClerkUser } from "@clerk/clerk-sdk-node";
import type { MongoUserDocument } from "@/types/mongo";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const FollowModel = await getFollowModel();
    const UserModel = await getUserModel();

    // Get following relationships
    const follows = await FollowModel.find({
      followerId: userId,
      status: 'accepted'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('followingId followingInfo status createdAt')
      .lean();

    // Get total count for pagination
    const total = await FollowModel.countDocuments({
      followerId: userId,
      status: 'accepted'
    });

    // Get user details for each following
    const followingUsers = await UserModel.find({
      clerkId: { $in: follows.map(f => f.followingId) }
    })
      .select('clerkId username displayName')
      .lean() as unknown as MongoUserDocument[];

    // Get Clerk user data for avatars
    const clerkUsers = await clerkClient.users.getUserList({
      userId: followingUsers.map(user => user.clerkId),
    });

    // Create maps for easy lookup
    const userMap = new Map(
      followingUsers.map(user => [user.clerkId, user])
    );
    const clerkUserMap = new Map<string, ClerkUser>(
      clerkUsers.map(user => [user.id, user])
    );

    // Combine follow data with user details and Clerk data
    const followingWithDetails = follows.map(follow => {
      const user = userMap.get(follow.followingId);
      const clerkUser = clerkUserMap.get(follow.followingId);
      return {
        followingId: follow.followingId,
        status: follow.status,
        createdAt: follow.createdAt,
        followingInfo: follow.followingInfo,
        user: user ? {
          ...user,
          imageUrl: clerkUser?.imageUrl ?? null,
          avatarUrl: clerkUser?.imageUrl ?? null
        } : null
      };
    });

    return NextResponse.json({
      results: followingWithDetails,
      total,
      page,
      pageSize: limit
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json(
      { error: "Failed to fetch following" },
      { status: 500 }
    );
  }
} 
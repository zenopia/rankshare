import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { getUserModel } from "@/lib/db/models-v2/user";
import { connectToMongoDB } from "@/lib/db/client";

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    // Remove @ if present and decode the username
    const username = decodeURIComponent(params.username).replace(/^@/, '');

    // Get user from Clerk first
    const users = await clerkClient.users.getUserList({
      username: [username]
    });
    const profileUser = users[0];

    if (!profileUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await connectToMongoDB();
    const FollowModel = await getFollowModel();
    const UserModel = await getUserModel();

    // Get follower relationships
    const follows = await FollowModel.find({
      followingId: profileUser.id,
      status: 'accepted'
    })
      .sort({ createdAt: -1 })
      .select('followerId followerInfo status createdAt')
      .lean();

    // Get user details for each follower
    const followerUsers = await UserModel.find({
      clerkId: { $in: follows.map(f => f.followerId) }
    })
      .select('clerkId username displayName')
      .lean();

    // Create a map for easy lookup
    const userMap = new Map(
      followerUsers.map(user => [user.clerkId, user])
    );

    // Combine follower data with user details
    const followersWithDetails = follows.map(follow => ({
      followerId: follow.followerId,
      status: follow.status,
      createdAt: follow.createdAt,
      followerInfo: follow.followerInfo,
      user: userMap.get(follow.followerId) || null
    }));

    return NextResponse.json({
      results: followersWithDetails,
      total: follows.length
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
} 
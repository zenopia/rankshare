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

    // Get following relationships
    const follows = await FollowModel.find({
      followerId: profileUser.id,
      status: 'accepted'
    })
      .sort({ createdAt: -1 })
      .select('followingId followingInfo status createdAt')
      .lean();

    // Get user details for each following
    const followingUsers = await UserModel.find({
      clerkId: { $in: follows.map(f => f.followingId) }
    })
      .select('clerkId username displayName')
      .lean();

    // Create a map for easy lookup
    const userMap = new Map(
      followingUsers.map(user => [user.clerkId, user])
    );

    // Combine following data with user details
    const followingWithDetails = follows.map(follow => ({
      followingId: follow.followingId,
      status: follow.status,
      createdAt: follow.createdAt,
      followingInfo: follow.followingInfo,
      user: userMap.get(follow.followingId) || null
    }));

    return NextResponse.json({
      results: followingWithDetails,
      total: follows.length
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    return NextResponse.json(
      { error: "Failed to fetch following" },
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
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

    await connectToMongoDB();
    const UserModel = await getUserModel();
    const FollowModel = await getFollowModel();

    // Get user from our database
    const profileUser = await UserModel.findOne({ username }).lean();

    if (!profileUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get follower relationships
    const follows = await FollowModel.find({
      followingId: profileUser.clerkId,
      status: 'accepted'
    })
      .sort({ createdAt: -1 })
      .select('followerId followerInfo status createdAt')
      .lean();

    // Get user details for each follower
    const followerUsers = await UserModel.find({
      clerkId: { $in: follows.map(f => f.followerId) }
    })
      .select('clerkId username displayName imageUrl')
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
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
} 
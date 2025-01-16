import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { getUserModel } from "@/lib/db/models-v2/user";

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

    // Get follower relationships
    const follows = await FollowModel.find({
      followingId: userId,
      status: 'accepted'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('followerId followerInfo status createdAt')
      .lean();

    // Get total count for pagination
    const total = await FollowModel.countDocuments({
      followingId: userId,
      status: 'accepted'
    });

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

    // Check if current user follows back each follower
    const followBackStatuses = await Promise.all(
      follows.map(follow =>
        FollowModel.findOne({
          followerId: userId,
          followingId: follow.followerId,
          status: 'accepted'
        }).lean()
      )
    );

    // Combine follower data with user details and follow-back status
    const followersWithDetails = follows.map((follow, index) => ({
      followerId: follow.followerId,
      status: follow.status,
      createdAt: follow.createdAt,
      followerInfo: follow.followerInfo,
      user: userMap.get(follow.followerId) || null,
      isFollowingBack: !!followBackStatuses[index]
    }));

    return NextResponse.json({
      results: followersWithDetails,
      total,
      page,
      pageSize: limit
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
} 
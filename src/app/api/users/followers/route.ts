import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { withAuth, getUserId } from "@/lib/auth/api-utils";

export const dynamic = 'force-dynamic';

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const userId = getUserId(req);
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    await connectToMongoDB();
    const UserModel = await getUserModel();
    const FollowModel = await getFollowModel();

    // Get followers
    const [followers, total] = await Promise.all([
      FollowModel.find({ followingId: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FollowModel.countDocuments({ followingId: userId })
    ]);

    // Get follower details
    const followerIds = followers.map((f) => f.followerId);
    const [followerDetails, clerkUsers] = await Promise.all([
      UserModel.find({
        clerkId: { $in: followerIds }
      })
        .select("username displayName bio followersCount followingCount")
        .lean(),
      clerkClient.users.getUserList({
        userId: followerIds,
      })
    ]);

    // Create maps for quick lookup
    const followerMap = new Map(
      followerDetails.map((f) => [f.clerkId, f])
    );
    const clerkUserMap = new Map(
      clerkUsers.map((u) => [u.id, u])
    );

    // Combine follow data with user details
    const enhancedFollowers = followers.map((follow) => {
      const follower = followerMap.get(follow.followerId);
      const clerkUser = clerkUserMap.get(follow.followerId);
      return {
        id: follow._id.toString(),
        followerId: follow.followerId,
        followingId: follow.followingId,
        createdAt: follow.createdAt,
        follower: follower
          ? {
              id: follower._id.toString(),
              username: follower.username,
              displayName: follower.displayName,
              bio: follower.bio || "",
              imageUrl: clerkUser?.imageUrl || null,
              followersCount: follower.followersCount || 0,
              followingCount: follower.followingCount || 0
            }
          : null
      };
    });

    return NextResponse.json({
      followers: enhancedFollowers,
      total,
      page,
      pageSize: limit
    });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}); 
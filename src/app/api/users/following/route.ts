import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { clerkClient } from "@clerk/clerk-sdk-node";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    await connectToMongoDB();
    const UserModel = await getUserModel();
    const FollowModel = await getFollowModel();

    // Get following relationships
    const [following, total] = await Promise.all([
      FollowModel.find({ followerId: user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      FollowModel.countDocuments({ followerId: user.id })
    ]);

    // Get user details for each followed user
    const followingIds = following.map((f) => f.followingId);
    const [followingDetails, clerkUsers] = await Promise.all([
      UserModel.find({
        clerkId: { $in: followingIds }
      })
        .select("username displayName bio followersCount followingCount")
        .lean(),
      clerkClient.users.getUserList({
        userId: followingIds,
      })
    ]);

    // Create maps for quick lookup
    const followingMap = new Map(
      followingDetails.map((f) => [f.clerkId, f])
    );
    const clerkUserMap = new Map(
      clerkUsers.map((u) => [u.id, u])
    );

    // Combine follow data with user details
    const enhancedFollowing = following.map((follow) => {
      const followedUser = followingMap.get(follow.followingId);
      const clerkUser = clerkUserMap.get(follow.followingId);
      return {
        id: follow._id.toString(),
        followerId: follow.followerId,
        followingId: follow.followingId,
        createdAt: follow.createdAt,
        following: followedUser
          ? {
              id: followedUser._id.toString(),
              username: followedUser.username,
              displayName: followedUser.displayName,
              bio: followedUser.bio || "",
              imageUrl: clerkUser?.imageUrl || null,
              followersCount: followedUser.followersCount || 0,
              followingCount: followedUser.followingCount || 0
            }
          : null
      };
    });

    return NextResponse.json({
      following: enhancedFollowing,
      total,
      page,
      pageSize: limit
    });
  } catch (error) {
    console.error("Error fetching following:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
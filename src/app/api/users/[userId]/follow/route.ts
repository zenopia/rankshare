import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { getUserModel } from "@/lib/db/models-v2/user";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: followerId } = auth();
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userToFollowId = params.userId;

    // Don't allow self-following
    if (followerId === userToFollowId) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    const UserModel = await getUserModel();
    const FollowModel = await getFollowModel();

    // Get both users' info
    const [follower, following] = await Promise.all([
      UserModel.findOne({ clerkId: followerId }).lean(),
      UserModel.findOne({ clerkId: userToFollowId }).lean()
    ]);

    if (!following) {
      return NextResponse.json(
        { error: "User to follow not found" },
        { status: 404 }
      );
    }

    if (!follower) {
      return NextResponse.json(
        { error: "Follower not found" },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await FollowModel.findOne({
      followerId,
      followingId: userToFollowId,
    });

    if (existingFollow) {
      return NextResponse.json(
        { message: "Already following" },
        { status: 200 }
      );
    }

    // Create new follow relationship
    await FollowModel.create({
      followerId,
      followingId: userToFollowId,
      status: 'accepted',
      followerInfo: {
        username: follower.username,
        displayName: follower.displayName
      },
      followingInfo: {
        username: following.username,
        displayName: following.displayName
      }
    });

    return NextResponse.json(
      { message: "Following user" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[FOLLOW_POST]", error);
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: followerId } = auth();
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userToUnfollowId = params.userId;

    const FollowModel = await getFollowModel();

    const follow = await FollowModel.findOne({
      followerId,
      followingId: userToUnfollowId,
    });

    if (!follow) {
      return NextResponse.json(
        { message: "Not following this user" },
        { status: 200 }
      );
    }

    await follow.deleteOne();

    return NextResponse.json(
      { message: "Unfollowed user" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[FOLLOW_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
} 
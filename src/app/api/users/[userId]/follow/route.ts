import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { logDatabaseAccess } from "@/lib/db/migration-utils";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: followerId } = auth();
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logDatabaseAccess('Follow User', true);
    const UserModel = await getUserModel();
    const FollowModel = await getFollowModel();

    // Get both users' info
    const [follower, following] = await Promise.all([
      UserModel.findOne({ clerkId: followerId }).lean(),
      UserModel.findOne({ clerkId: params.userId }).lean()
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
      followingId: params.userId,
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
      followingId: params.userId,
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
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: followerId } = auth();
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logDatabaseAccess('Unfollow User', true);
    const FollowModel = await getFollowModel();

    const follow = await FollowModel.findOne({
      followerId,
      followingId: params.userId,
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
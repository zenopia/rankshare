import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { getUserModel } from "@/lib/db/models-v2/user";

export async function POST(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { userId: followerId } = auth();
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove @ if present and decode the username
    const username = decodeURIComponent(params.username).replace(/^@/, '');

    // Get user from Clerk first
    const users = await clerkClient.users.getUserList({
      username: [username]
    });
    const userToFollow = users[0];

    if (!userToFollow) {
      return NextResponse.json(
        { error: "User to follow not found" },
        { status: 404 }
      );
    }

    const UserModel = await getUserModel();
    const FollowModel = await getFollowModel();

    // Get both users' info
    const [follower, following] = await Promise.all([
      UserModel.findOne({ clerkId: followerId }).lean(),
      UserModel.findOne({ clerkId: userToFollow.id }).lean()
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
      followingId: userToFollow.id,
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
      followingId: userToFollow.id,
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
  { params }: { params: { username: string } }
) {
  try {
    const { userId: followerId } = auth();
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove @ if present and decode the username
    const username = decodeURIComponent(params.username).replace(/^@/, '');

    // Get user from Clerk first
    const users = await clerkClient.users.getUserList({
      username: [username]
    });
    const userToUnfollow = users[0];

    if (!userToUnfollow) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const FollowModel = await getFollowModel();

    const follow = await FollowModel.findOne({
      followerId,
      followingId: userToUnfollow.id,
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
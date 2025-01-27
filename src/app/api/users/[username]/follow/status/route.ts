import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { getFollowModel } from "@/lib/db/models-v2/follow";

export async function GET(
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
    const userToCheck = users[0];

    if (!userToCheck) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const FollowModel = await getFollowModel();

    // Check if following
    const existingFollow = await FollowModel.findOne({
      followerId,
      followingId: userToCheck.id,
      status: 'accepted'
    });

    return NextResponse.json({
      isFollowing: !!existingFollow
    });
  } catch (error) {
    console.error("[FOLLOW_STATUS_GET]", error);
    return NextResponse.json(
      { error: "Failed to check follow status" },
      { status: 500 }
    );
  }
} 
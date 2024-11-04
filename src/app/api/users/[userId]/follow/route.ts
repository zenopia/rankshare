import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/mongodb";
import { FollowModel } from "@/lib/db/models/follow";
import { UserModel } from "@/lib/db/models/user";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    if (currentUserId === params.userId) {
      return new NextResponse(
        JSON.stringify({ error: "Cannot follow yourself" }), 
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user exists
    const userExists = await UserModel.exists({ clerkId: params.userId });
    if (!userExists) {
      return new NextResponse(
        JSON.stringify({ error: "User not found" }), 
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await FollowModel.findOne({
      followerId: currentUserId,
      followingId: params.userId,
    });

    if (existingFollow) {
      // If already following, unfollow
      await FollowModel.deleteOne({ _id: existingFollow._id });
      return new NextResponse(
        JSON.stringify({ message: "Unfollowed successfully" }), 
        { status: 200 }
      );
    }

    // Create new follow
    await FollowModel.create({
      followerId: currentUserId,
      followingId: params.userId,
      lastCheckedAt: new Date(),
    });

    return new NextResponse(
      JSON.stringify({ message: "Followed successfully" }), 
      { status: 201 }
    );
  } catch (error) {
    console.error("[FOLLOW_POST]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to follow/unfollow user"
      }), 
      { status: 500 }
    );
  }
} 
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/mongodb";
import { FollowModel } from "@/lib/db/models/follow";

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: followerId } = await auth();
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Check if already following
    const existingFollow = await FollowModel.findOne({
      followerId,
      followingId: params.userId,
    });

    if (existingFollow) {
      return NextResponse.json({ message: "Already following" }, { status: 200 });
    }

    // Create new follow
    await FollowModel.create({
      followerId,
      followingId: params.userId,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Following user" }, { status: 201 });
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
    const { userId: followerId } = await auth();
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    await FollowModel.findOneAndDelete({
      followerId,
      followingId: params.userId,
    });

    return NextResponse.json({ message: "Unfollowed user" }, { status: 200 });
  } catch (error) {
    console.error("[FOLLOW_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 500 }
    );
  }
} 
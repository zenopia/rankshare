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
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    await dbConnect();

    // Create follow relationship
    await FollowModel.create({
      followerId,
      followingId: params.userId,
      createdAt: new Date(),
    });

    return new NextResponse(
      JSON.stringify({ message: "Successfully followed user" }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("[FOLLOW_POST]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to follow user"
      }), 
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
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    await dbConnect();

    // Delete follow relationship
    await FollowModel.deleteOne({
      followerId,
      followingId: params.userId,
    });

    return new NextResponse(
      JSON.stringify({ message: "Successfully unfollowed user" }), 
      { status: 200 }
    );
  } catch (error) {
    console.error("[FOLLOW_DELETE]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to unfollow user"
      }), 
      { status: 500 }
    );
  }
} 
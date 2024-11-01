import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/mongodb";
import { FollowModel } from "@/lib/db/models/follow";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    const resolvedParams = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    if (userId === resolvedParams.userId) {
      return new NextResponse(
        JSON.stringify({ error: "Cannot follow yourself" }), 
        { status: 400 }
      );
    }

    await dbConnect();

    await FollowModel.create({
      followerId: userId,
      followingId: resolvedParams.userId,
      lastCheckedAt: new Date(),
    });

    return new NextResponse(
      JSON.stringify({ message: "User followed successfully" }), 
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
  { params }: { params: Promise<{ userId: string }> | { userId: string } }
) {
  try {
    const resolvedParams = await params;
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { status: 401 }
      );
    }

    await dbConnect();

    await FollowModel.deleteOne({
      followerId: userId,
      followingId: resolvedParams.userId,
    });

    return new NextResponse(
      JSON.stringify({ message: "User unfollowed successfully" }), 
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
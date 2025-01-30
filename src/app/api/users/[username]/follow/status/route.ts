import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getFollowModel } from "@/lib/db/models-v2/follow";

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { username } = params;

    // Get the target user's Clerk ID
    const targetUser = await AuthService.getUserByUsername(username);
    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    await connectToMongoDB();
    const FollowModel = await getFollowModel();

    // Check if the current user is following the target user
    const follow = await FollowModel.findOne({
      followerId: user.id,
      followingId: targetUser.id
    }).lean();

    return NextResponse.json({ isFollowing: !!follow });
  } catch (error) {
    console.error("Error checking follow status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
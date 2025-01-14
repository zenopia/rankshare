import { auth, clerkClient } from "@clerk/nextjs/server";
import type { UserResource } from "@clerk/types";
import { NextResponse } from "next/server";
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";

// Mark the route as dynamic since it requires auth and database access
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get following relationships
    const following = await FollowModel.find({ followerId: userId });
    
    if (!following.length) {
      return NextResponse.json({ results: [] });
    }

    // Get user details from Clerk
    const users = await clerkClient.users.getUserList({
      userId: following.map(f => f.followingId),
    });

    const results = users.map((user: UserResource) => ({
      clerkId: user.id,
      username: user.username || '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json(
      { error: "Failed to fetch following" },
      { status: 500 }
    );
  }
} 
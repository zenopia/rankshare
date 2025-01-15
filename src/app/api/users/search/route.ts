import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { logDatabaseAccess } from "@/lib/db/migration-utils";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    logDatabaseAccess('User Search', true);
    const UserModel = await getUserModel();
    const FollowModel = await getFollowModel();

    // Search users, either by query or get all users if no query
    const users = await UserModel.find(
      query ? {
        $text: { $search: query },
        clerkId: { $ne: userId } // Exclude the current user
      } : {
        clerkId: { $ne: userId } // Exclude the current user
      },
      query ? { score: { $meta: "textScore" } } : undefined
    )
      .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 }) // Sort by relevance or newest first
      .limit(limit)
      .lean();

    // If authenticated, get follow status for each user
    if (userId) {
      const followStatuses = await Promise.all(
        users.map(user =>
          FollowModel.findOne({
            followerId: userId,
            followingId: user.clerkId,
            status: 'accepted'
          }).lean()
        )
      );

      // Combine user data with follow status
      const usersWithFollowStatus = users.map((user, index) => ({
        ...user,
        isFollowing: !!followStatuses[index]
      }));

      return NextResponse.json(usersWithFollowStatus);
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
} 
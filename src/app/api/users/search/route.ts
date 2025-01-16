import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getFollowModel } from "@/lib/db/models-v2/follow";
import { logDatabaseAccess } from "@/lib/db/migration-utils";
import type { User as ClerkUser } from "@clerk/clerk-sdk-node";
import type { MongoUserDocument } from "@/types/mongo";

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
      .lean() as unknown as MongoUserDocument[];

    // Get Clerk user data for avatars
    const clerkUsers = await clerkClient.users.getUserList({
      userId: users.map(user => user.clerkId),
    });

    // Create a map of Clerk user data
    const clerkUserMap = new Map<string, ClerkUser>(
      clerkUsers.map(user => [user.id, user])
    );

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

      // Combine user data with follow status and Clerk data
      const usersWithDetails = users.map((user, index) => {
        const clerkUser = clerkUserMap.get(user.clerkId);
        return {
          ...user,
          imageUrl: clerkUser?.imageUrl ?? null,
          avatarUrl: clerkUser?.imageUrl ?? null,
          isFollowing: !!followStatuses[index]
        };
      });

      return NextResponse.json(usersWithDetails);
    }

    // Combine user data with Clerk data
    const usersWithDetails = users.map(user => {
      const clerkUser = clerkUserMap.get(user.clerkId);
      return {
        ...user,
        imageUrl: clerkUser?.imageUrl ?? null,
        avatarUrl: clerkUser?.imageUrl ?? null
      };
    });

    return NextResponse.json(usersWithDetails);
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
} 
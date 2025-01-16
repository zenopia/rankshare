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
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    await logDatabaseAccess('users.search', true);

    const UserModel = await getUserModel();
    const FollowModel = await getFollowModel();

    // Build search query
    const searchQuery = query ? {
      $and: [
        { clerkId: { $ne: userId } },
        {
          $or: [
            { username: { $regex: query, $options: 'i' } },
            { displayName: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    } : {
      clerkId: { $ne: userId }
    };

    // Execute search with appropriate sorting
    const users = await UserModel.find(searchQuery)
      .select({
        clerkId: 1,
        username: 1,
        displayName: 1,
        followersCount: 1,
        followingCount: 1,
        listCount: 1,
        privacySettings: 1
      })
      .sort(query ? {
        followersCount: -1,
        username: 1
      } : {
        createdAt: -1
      })
      .limit(limit)
      .lean() as unknown as MongoUserDocument[];

    // Get Clerk data for avatars
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
    console.error('Error in user search:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
} 
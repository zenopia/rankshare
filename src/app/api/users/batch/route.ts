import { NextResponse } from "next/server";
import { clerkClient, User } from "@clerk/clerk-sdk-node";
import { getUserCacheModel, UserCacheDocument } from "@/lib/db/models-v2/user-cache";
import { connectToMongoDB } from "@/lib/db/client";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    await connectToMongoDB();
    const UserCacheModel = await getUserCacheModel();

    // Get cached users that are not expired
    const cachedUsers = await UserCacheModel.find({
      clerkId: { $in: userIds },
      lastSynced: { $gt: new Date(Date.now() - CACHE_TTL) }
    }).lean();

    // Find which users need to be fetched from Clerk
    const cachedUserIds = new Set(cachedUsers.map(u => u.clerkId));
    const missingUserIds = userIds.filter(id => !cachedUserIds.has(id));

    let clerkUsers: User[] = [];
    if (missingUserIds.length > 0) {
      // Fetch missing users from Clerk
      clerkUsers = await clerkClient.users.getUserList({
        userId: missingUserIds,
      });

      // Prepare bulk write operations for cache updates
      const bulkOps = clerkUsers.map(user => ({
        updateOne: {
          filter: { clerkId: user.id },
          update: {
            $set: {
              clerkId: user.id,
              username: user.username || '',
              displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '',
              imageUrl: user.imageUrl,
              lastSynced: new Date()
            }
          },
          upsert: true
        }
      }));

      // Update cache
      if (bulkOps.length > 0) {
        await UserCacheModel.bulkWrite(bulkOps);
      }
    }

    // Combine cached and fresh data
    const userMap = new Map();
    
    // Add cached users to map
    cachedUsers.forEach((user: UserCacheDocument) => {
      userMap.set(user.clerkId, {
        id: user.clerkId,
        username: user.username,
        displayName: user.displayName,
        imageUrl: user.imageUrl
      });
    });

    // Add fresh Clerk users to map
    clerkUsers.forEach((user: User) => {
      userMap.set(user.id, {
        id: user.id,
        username: user.username,
        displayName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || '',
        imageUrl: user.imageUrl
      });
    });

    // Convert map to array in the same order as requested
    const result = userIds.map(id => userMap.get(id)).filter(Boolean);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in batch user fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 
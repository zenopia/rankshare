import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { auth } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import { FollowModel } from "@/lib/db/models/follow";
import dbConnect from "@/lib/db/mongodb";
import type { User } from "@/types/list";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { userId } = auth();
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    
    // Get all users from Clerk
    const clerkUsers = await clerkClient.users.getUserList();

    // Filter users if there's a search query
    const filteredUsers = query 
      ? clerkUsers.filter(user => {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
          const username = (user.username || '').toLowerCase();
          return fullName.includes(query) || username.includes(query);
        })
      : clerkUsers;

    // Get list counts and follow status for filtered users in parallel
    const usersWithData = await Promise.all(
      filteredUsers.map(async (user): Promise<User> => {
        const [listCount, followStatus] = await Promise.all([
          ListModel.countDocuments({
            ownerId: user.id,
            privacy: 'public'
          }),
          userId ? FollowModel.findOne({
            followerId: userId,
            followingId: user.id
          }) : null
        ]);

        return {
          clerkId: user.id,
          username: user.username || "",
          firstName: user.firstName || "",
          imageUrl: user.imageUrl,
          hasNewLists: false,
          lastListCreated: undefined,
          listCount,
          isFollowing: !!followStatus
        };
      })
    );

    return NextResponse.json(usersWithData);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 
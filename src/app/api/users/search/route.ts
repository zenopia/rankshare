import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { ListModel } from "@/lib/db/models/list";
import dbConnect from "@/lib/db/mongodb";
import type { User } from "@/types/list";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    
    // Get all users from Clerk without filtering
    const clerkUsers = await clerkClient.users.getUserList();

    // Filter users if there's a search query
    const filteredUsers = query 
      ? clerkUsers.filter(user => {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
          const username = (user.username || '').toLowerCase();
          return fullName.includes(query) || username.includes(query);
        })
      : clerkUsers;

    // Get list counts for filtered users in parallel
    const usersWithCounts = await Promise.all(
      filteredUsers.map(async (user): Promise<User> => {
        const listCount = await ListModel.countDocuments({
          ownerId: user.id,
          privacy: 'public'
        });

        return {
          clerkId: user.id,
          username: user.username || "",
          firstName: user.firstName || "",
          imageUrl: user.imageUrl,
          hasNewLists: false,
          lastListCreated: undefined,
          listCount
        };
      })
    );

    return NextResponse.json(usersWithCounts);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 
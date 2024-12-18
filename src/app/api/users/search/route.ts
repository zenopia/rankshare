import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import type { User } from "@/types/list";

export async function GET(_request: NextRequest) {
  try {
    // Get all users from Clerk without filtering
    const clerkUsers = await clerkClient.users.getUserList();

    const users = clerkUsers.map((user): User => ({
      clerkId: user.id,
      username: user.username || "",
      firstName: user.firstName || "",
      imageUrl: user.imageUrl,
      hasNewLists: false,
      lastListCreated: undefined,
      listCount: 0  // We'll add real counts later
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 
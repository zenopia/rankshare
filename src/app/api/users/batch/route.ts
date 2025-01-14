import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";

interface UserProfile {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids');

    if (!ids) {
      return NextResponse.json({ error: "User IDs are required" }, { status: 400 });
    }

    const userIds = ids.split(',');
    const users = await clerkClient.users.getUserList({ userId: userIds });

    // Convert array to object with userId as key
    const userProfiles = users.reduce((acc: Record<string, UserProfile>, user: User) => {
      acc[user.id] = {
        id: user.id,
        username: user.username || '',
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      };
      return acc;
    }, {});

    return NextResponse.json(userProfiles);
  } catch (error) {
    console.error('Error fetching user profiles:', error);
    return NextResponse.json(
      { error: "Failed to fetch user profiles" },
      { status: 500 }
    );
  }
} 
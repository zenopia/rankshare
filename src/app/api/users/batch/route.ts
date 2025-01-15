import { NextResponse } from "next/server";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";
import { logDatabaseAccess } from "@/lib/db/migration-utils";

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    logDatabaseAccess('User Batch Fetch', true);
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();

    // Fetch users and their profiles in parallel
    const users = await UserModel.find({ 
      clerkId: { $in: userIds } 
    })
      .select('clerkId username displayName followersCount followingCount listCount')
      .lean();

    // Create a map of users by clerkId for easy lookup
    const userMap = new Map(users.map(user => [user.clerkId, user]));

    // Get user IDs that exist in our database
    const existingUserIds = users.map(user => user._id);

    // Fetch profiles for existing users
    const profiles = await UserProfileModel.find({ 
      userId: { $in: existingUserIds }
    })
      .select('userId bio location dateOfBirth gender livingStatus privacySettings')
      .lean();

    // Create a map of profiles by userId for easy lookup
    const profileMap = new Map(profiles.map(profile => [profile.userId.toString(), profile]));

    // Combine user data with their profiles
    const usersWithProfiles = users.map(user => ({
      ...user,
      profile: profileMap.get(user._id.toString()) || null
    }));

    return NextResponse.json(usersWithProfiles);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 
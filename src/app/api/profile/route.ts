import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();

    const user = await UserModel.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await UserProfileModel.findOne({ userId: user._id });

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    const data = await request.json();
    
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();

    // Create or update user
    const userUpdate = {
      clerkId: userId,
      username: data.username,
      displayName: data.displayName || data.username,
    };

    const user = await UserModel.findOneAndUpdate(
      { clerkId: userId },
      userUpdate,
      { 
        new: true,
        upsert: true // Create if doesn't exist
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: "Failed to create/update user" },
        { status: 500 }
      );
    }

    // Create or update profile
    const profileUpdate = {
      userId: user._id,
      ...data.profile,
      privacySettings: data.privacySettings || {
        showBio: true,
        showLocation: true,
        showDateOfBirth: false,
        showGender: true,
        showLivingStatus: true
      }
    };

    const profile = await UserProfileModel.findOneAndUpdate(
      { userId: user._id },
      profileUpdate,
      { 
        new: true,
        upsert: true // Create if doesn't exist
      }
    );

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 
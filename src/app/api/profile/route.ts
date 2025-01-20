import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";
import { getListModel } from "@/lib/db/models-v2/list";
import { connectToMongoDB } from "@/lib/db/client";

async function updateEmailInvites(email: string, clerkId: string, username: string) {
  const ListModel = await getListModel();
  
  // Find all lists where this email has pending invites
  const lists = await ListModel.find({
    'collaborators': {
      $elemMatch: {
        email: email,
        _isEmailInvite: true,
        status: 'pending'
      }
    }
  });

  // Update each list's collaborator entry
  for (const list of lists) {
    await ListModel.updateOne(
      { 
        _id: list._id,
        'collaborators': {
          $elemMatch: {
            email: email,
            _isEmailInvite: true,
            status: 'pending'
          }
        }
      },
      {
        $set: {
          'collaborators.$._isEmailInvite': false,
          'collaborators.$.clerkId': clerkId,
          'collaborators.$.username': username,
          'collaborators.$.status': 'accepted',
          'collaborators.$.acceptedAt': new Date()
        }
      }
    );
  }
}

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      throw new Error('Unauthorized');
    }

    await connectToMongoDB();
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();

    const user = await UserModel.findOne({ clerkId: userId });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await UserProfileModel.findOne({ userId: user._id });

    // If no profile exists yet, return a default incomplete profile
    if (!profile) {
      return NextResponse.json({
        user,
        profile: {
          profileComplete: false
        }
      });
    }

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

    await connectToMongoDB();
    const data = await request.json();
    
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();

    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if profile exists
    let profile = await UserProfileModel.findOne({ userId: user._id });

    // Prepare profile data
    const profileData = {
      userId: user._id,
      bio: data.bio,
      location: data.location,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      livingStatus: data.livingStatus,
      privacySettings: data.privacySettings
    };

    // Calculate profile completion status
    const isComplete = !!(
      profileData.location &&
      profileData.dateOfBirth &&
      profileData.gender &&
      profileData.livingStatus
    );

    if (profile) {
      // Update existing profile
      Object.assign(profile, profileData);
      profile.profileComplete = isComplete;
      await profile.save();
    } else {
      // Create new profile
      profile = await UserProfileModel.create({
        ...profileData,
        profileComplete: isComplete
      });
    }

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
} 
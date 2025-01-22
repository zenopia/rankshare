import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";
import { getListModel } from "@/lib/db/models-v2/list";
import { connectToDatabase } from "@/lib/db/mongodb";

const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL?.split('/sign-in')[0] || 'https://accounts.favely.net',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Clerk-Auth',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // Cache preflight request for 24 hours
} as const;

export async function OPTIONS(request: Request) {
  // Get the actual origin from the request
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    'https://accounts.favely.net',
    'https://favely.net',
    'http://localhost:3000',
    'http://localhost:3001'
  ] as const;

  // Only set Access-Control-Allow-Origin if the origin is allowed
  const headers = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin as typeof allowedOrigins[number]) ? origin : corsHeaders['Access-Control-Allow-Origin']
  } satisfies HeadersInit;

  return new NextResponse(null, { 
    status: 204,
    headers
  });
}

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

export async function GET(request: Request) {
  try {
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = [
      'https://accounts.favely.net',
      'https://favely.net',
      'http://localhost:3000',
      'http://localhost:3001'
    ] as const;

    const headers = {
      ...corsHeaders,
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin as typeof allowedOrigins[number]) ? origin : corsHeaders['Access-Control-Allow-Origin']
    } satisfies HeadersInit;

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { 
        status: 401,
        headers
      });
    }

    await connectToDatabase();
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();

    // Get or create user
    let user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      // Get user data from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);
      
      // Create new user document
      user = await UserModel.create({
        clerkId: userId,
        username: clerkUser.username || '',
        displayName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || clerkUser.username || '',
        searchIndex: `${clerkUser.username || ''} ${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.toLowerCase(),
        followersCount: 0,
        followingCount: 0,
        listCount: 0
      });
    }

    const profile = await UserProfileModel.findOne({ userId: user._id });

    // If profile exists, ensure profileComplete is calculated correctly
    if (profile) {
      profile.profileComplete = !!(
        profile.location &&
        profile.dateOfBirth &&
        profile.gender &&
        profile.livingStatus
      );
      await profile.save();
    }

    return NextResponse.json({ user, profile }, { headers });
  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin') || '';
    const allowedOrigins = [
      'https://accounts.favely.net',
      'https://favely.net',
      'http://localhost:3000',
      'http://localhost:3001'
    ] as const;

    const headers = {
      ...corsHeaders,
      'Access-Control-Allow-Origin': allowedOrigins.includes(origin as typeof allowedOrigins[number]) ? origin : corsHeaders['Access-Control-Allow-Origin']
    } satisfies HeadersInit;

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { 
        status: 401,
        headers
      });
    }

    await connectToDatabase();
    const data = await request.json();
    
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();

    const [user, clerkUser] = await Promise.all([
      UserModel.findOne({ clerkId: userId }),
      clerkClient.users.getUser(userId)
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if profile exists
    const profile = await UserProfileModel.findOne({ userId: user._id });

    // Prepare profile data
    const profileData = {
      userId: user._id,
      bio: data.bio,
      location: data.location,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      livingStatus: data.livingStatus,
      privacySettings: data.privacySettings || {
        showBio: true,
        showLocation: true,
        showDateOfBirth: false,
        showGender: true,
        showLivingStatus: true
      }
    };

    // Calculate profile completion status
    const isComplete = !!(
      profileData.location &&
      profileData.dateOfBirth &&
      profileData.gender &&
      profileData.livingStatus
    );

    let updatedProfile;
    if (profile) {
      // Update existing profile
      updatedProfile = await UserProfileModel.findOneAndUpdate(
        { userId: user._id },
        {
          ...profileData,
          profileComplete: isComplete
        },
        { new: true }
      );
    } else {
      // Create new profile
      updatedProfile = await UserProfileModel.create({
        ...profileData,
        profileComplete: isComplete
      });

      // If this is a new profile and it's complete, update any email invites
      const primaryEmail = clerkUser.emailAddresses.find((email: { id: string; emailAddress: string }) => email.id === clerkUser.primaryEmailAddressId)?.emailAddress;
      if (isComplete && primaryEmail) {
        await updateEmailInvites(primaryEmail, userId, user.username);
      }
    }

    return NextResponse.json({ success: true, profile: updatedProfile }, { headers });
  } catch (error) {
    console.error('Error in profile POST:', error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { 
        status: 401,
        headers: corsHeaders
      });
    }

    await connectToDatabase();
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();
    const ListModel = await getListModel();

    // Get user document to find MongoDB _id
    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user's profile
    await UserProfileModel.deleteOne({ userId: user._id });

    // Delete user's lists
    await ListModel.deleteMany({ userId: user._id });

    // Delete the user document itself
    await UserModel.deleteOne({ _id: user._id });

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500, headers: corsHeaders }
    );
  }
} 
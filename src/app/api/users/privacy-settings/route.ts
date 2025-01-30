import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";

export async function PUT(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { userId, settings } = body;

    if (!userId || !settings) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Connect to MongoDB
    await connectToMongoDB();
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();

    // Verify the user has permission to update these settings
    const user = await UserModel.findOne({ clerkId }).lean();
    if (!user || user._id.toString() !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update or create user profile with new privacy settings
    await UserProfileModel.findOneAndUpdate(
      { userId: user._id },
      { 
        $set: { 
          privacySettings: {
            showBio: settings.showBio ?? true,
            showLocation: settings.showLocation ?? true,
            showDateOfBirth: settings.showDateOfBirth ?? false,
            showGender: settings.showGender ?? true,
            showLivingStatus: settings.showLivingStatus ?? true
          }
        }
      },
      { upsert: true }
    );

    return new NextResponse("Privacy settings updated successfully", { status: 200 });
  } catch (error) {
    console.error("Error updating privacy settings:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
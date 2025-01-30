import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";
import { getUserProfileModel } from "@/lib/db/models-v2/user-profile";
import { getListModel } from "@/lib/db/models-v2/list";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to MongoDB
    await connectToMongoDB();
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();

    // Get user from MongoDB using clerkId
    const user = await UserModel.findOne({ clerkId }).lean();
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get user profile using MongoDB _id
    const profile = await UserProfileModel.findOne({ userId: user._id }).lean();

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // Connect to MongoDB
    await connectToMongoDB();
    const UserModel = await getUserModel();
    const UserProfileModel = await getUserProfileModel();

    // Get user from MongoDB using clerkId
    const user = await UserModel.findOne({ clerkId }).lean();
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Update or create user profile
    const updatedProfile = await UserProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: {
          bio: body.bio,
          location: body.location,
          dateOfBirth: body.dateOfBirth,
          gender: body.gender,
          livingStatus: body.livingStatus,
          profileComplete: true,
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ user, profile: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToMongoDB();
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
} 
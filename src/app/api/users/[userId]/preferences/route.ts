import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = auth();
    if (!currentUserId || currentUserId !== params.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectToMongoDB();
    const UserModel = await getUserModel();
    
    const user = await UserModel.findOne({ clerkId: params.userId }).select('preferences').lean();
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      notifications: user.preferences.notifications,
      privacy: user.preferences.privacy,
      theme: user.preferences.theme
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: "Failed to fetch user preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = auth();
    if (!currentUserId || currentUserId !== params.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    await connectToMongoDB();
    const UserModel = await getUserModel();
    
    const updateData: Record<string, any> = {};
    
    // Only update provided fields
    if (data.notifications) {
      updateData['preferences.notifications'] = data.notifications;
    }
    if (data.privacy) {
      updateData['preferences.privacy'] = data.privacy;
    }
    if (data.theme) {
      updateData['preferences.theme'] = data.theme;
    }

    const user = await UserModel.findOneAndUpdate(
      { clerkId: params.userId },
      { $set: updateData },
      { new: true }
    ).select('preferences').lean();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      notifications: user.preferences.notifications,
      privacy: user.preferences.privacy,
      theme: user.preferences.theme
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: "Failed to update user preferences" },
      { status: 500 }
    );
  }
} 
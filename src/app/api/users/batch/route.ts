import { NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "User IDs array is required" },
        { status: 400 }
      );
    }

    await connectToMongoDB();
    const UserModel = await getUserModel();

    // Get users from database
    const users = await UserModel.find({
      clerkId: { $in: userIds }
    }).lean();

    // Create a map for quick lookup
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user.clerkId, {
        id: user.clerkId,
        username: user.username,
        displayName: user.displayName,
        imageUrl: user.imageUrl
      });
    });

    // Convert map to array in the same order as requested
    const result = userIds.map(id => userMap.get(id)).filter(Boolean);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in batch user fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
} 
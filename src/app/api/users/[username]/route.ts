import { NextRequest, NextResponse } from "next/server";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";

interface UserResponse {
  id: string;
  username: string;
  displayName: string;
  imageUrl: string | null;
}

interface ErrorResponse {
  error: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
): Promise<NextResponse<UserResponse | ErrorResponse>> {
  try {
    // Remove @ if present and decode the username
    const username = decodeURIComponent(params.username).replace(/^@/, '');

    // Get user from our database
    await connectToMongoDB();
    const UserModel = await getUserModel();
    const user = await UserModel.findOne({ username }).lean();

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const response: UserResponse = {
      id: user.clerkId,
      username: user.username,
      displayName: user.displayName,
      imageUrl: user.imageUrl
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
} 
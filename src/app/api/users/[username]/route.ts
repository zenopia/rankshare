import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

interface UserResponse {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
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

    // Get user from Clerk
    const users = await clerkClient.users.getUserList({
      username: [username]
    });
    const user = users[0];

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const response: UserResponse = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
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
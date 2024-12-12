import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { UserModel } from "@/lib/db/models/user";
import dbConnect from "@/lib/db/mongodb";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const user = await UserModel.findOne({ clerkId: userId });
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    await dbConnect();

    const user = await UserModel.findOneAndUpdate(
      { clerkId: userId },
      { $set: data },
      { new: true }
    );

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
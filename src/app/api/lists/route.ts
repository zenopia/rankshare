import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getEnhancedLists } from "@/lib/actions/lists";

export async function GET(request: Request) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const privacy = searchParams.get("privacy");
    const query: any = { "owner.clerkId": user.id };

    if (category) {
      query.category = category;
    }
    if (privacy) {
      query.privacy = privacy;
    }

    const { lists } = await getEnhancedLists(query);
    return NextResponse.json({ lists });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, category, privacy, items } = body;

    await connectToMongoDB();
    const ListModel = await getListModel();

    const list = await ListModel.create({
      title,
      description,
      category,
      privacy,
      items: items || [],
      owner: {
        clerkId: user.id,
        userId: user.id,
        username: user.username || "",
        joinedAt: new Date()
      },
      collaborators: [],
      stats: {
        viewCount: 0,
        pinCount: 0,
        copyCount: 0
      }
    });

    return NextResponse.json({ list });
  } catch (error) {
    console.error("Error creating list:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
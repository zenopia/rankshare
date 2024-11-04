import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db/mongodb";
import { ListModel } from "@/lib/db/models/list";
import { createListSchema } from "@/lib/validations/list";
import type { FilterQuery } from 'mongoose';
import type { List } from '@/types/list';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return new NextResponse(
        JSON.stringify({ error: "You must be signed in to create a list" }), 
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const json = await req.json();
    const validatedData = createListSchema.parse(json);

    await dbConnect();

    const list = await ListModel.create({
      ...validatedData,
      ownerId: userId,
      ownerName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'Anonymous',
      viewCount: 0,
      items: json.items.map((item: { title: string; comment?: string }, index: number) => ({
        title: item.title,
        rank: index + 1,
        comment: item.comment,
      })),
    });

    return new NextResponse(
      JSON.stringify(list), 
      { 
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error creating list:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to create list'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");

    const filter: FilterQuery<List> = { privacy: "public" };
    if (category) filter.category = category;
    if (query) filter.$text = { $search: query };

    const lists = await ListModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
      .exec();

    return NextResponse.json(lists);
  } catch (error) {
    console.error("[LISTS_GET]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal Server Error" 
      }), 
      { status: 500 }
    );
  }
} 
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getListModel, ListDocument, ListCollaborator } from "@/lib/db/models-v2/list";
import { logDatabaseAccess } from "@/lib/db/migration-utils";

// Helper function to check if user has access to the list
async function hasListAccess(list: ListDocument, userId: string | null) {
  if (!userId) return list.privacy === 'public';
  
  return (
    list.privacy === 'public' ||
    list.owner.clerkId === userId ||
    list.collaborators.some((c: ListCollaborator) => 
      c.clerkId === userId && c.status === 'accepted'
    )
  );
}

// Helper function to check if user can edit the list
async function canEditList(list: ListDocument, userId: string | null) {
  if (!userId) return false;
  
  return (
    list.owner.clerkId === userId ||
    list.collaborators.some((c: ListCollaborator) => 
      c.clerkId === userId && 
      c.status === 'accepted' && 
      ['admin', 'editor'].includes(c.role)
    )
  );
}

export async function GET(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    const { listId } = params;

    logDatabaseAccess('List Detail', true);
    const ListModel = await getListModel();

    const list = await ListModel.findById(listId).lean();

    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    if (!await hasListAccess(list, userId)) {
      return NextResponse.json(
        { error: "Not authorized to view this list" },
        { status: 403 }
      );
    }

    // Increment view count for non-owners
    if (userId !== list.owner.clerkId) {
      await ListModel.updateOne(
        { _id: listId },
        { $inc: { 'stats.viewCount': 1 } }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId } = params;
    const data = await request.json();
    const { title, description, category, privacy, items } = data;

    logDatabaseAccess('List Update', true);
    const ListModel = await getListModel();

    const list = await ListModel.findById(listId).lean();

    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Check edit permissions
    if (!await canEditList(list, userId)) {
      return NextResponse.json(
        { error: "Not authorized to edit this list" },
        { status: 403 }
      );
    }

    // Update list
    const updatedList = await ListModel.findByIdAndUpdate(
      listId,
      {
        $set: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(category && { category }),
          ...(privacy && { privacy }),
          ...(items && { items })
        }
      },
      { new: true }
    ).lean();

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listId } = params;

    logDatabaseAccess('List Delete', true);
    const ListModel = await getListModel();

    const list = await ListModel.findById(listId).lean();

    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Only owner can delete the list
    if (list.owner.clerkId !== userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this list" },
        { status: 403 }
      );
    }

    await ListModel.findByIdAndDelete(listId);

    return NextResponse.json(
      { message: "List deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
} 
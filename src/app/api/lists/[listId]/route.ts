import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getListModel, ListDocument, ListCollaborator } from "@/lib/db/models-v2/list";

interface ListItem {
  title: string;
  comment?: string;
  properties?: Array<{
    type?: string;
    label: string;
    value: string;
  }>;
}

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
    const { listId } = params;
    const requestUserId = request.headers.get('X-User-Id');

    const ListModel = await getListModel();
    
    // First get the list without incrementing
    const list = await ListModel.findById(listId).lean();

    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Check access permissions using requestUserId
    if (!await hasListAccess(list, requestUserId)) {
      return NextResponse.json(
        { error: "Not authorized to view this list" },
        { status: 403 }
      );
    }

    // Only increment view count if viewer is not the owner
    let updatedList;
    if (list.owner.clerkId !== requestUserId) {
      const updated = await ListModel.findByIdAndUpdate(
        listId,
        { $inc: { 'stats.viewCount': 1 } },
        { new: true }
      ).lean();

      if (!updated) {
        return NextResponse.json(
          { error: "Failed to update view count" },
          { status: 500 }
        );
      }
      updatedList = updated;
    } else {
      updatedList = list;
    }

    // Convert _id to string for the response
    const { _id, ...rest } = updatedList;
    const responseList = {
      ...rest,
      id: _id.toString(),
      createdAt: updatedList.createdAt?.toISOString(),
      updatedAt: updatedList.updatedAt?.toISOString(),
      editedAt: updatedList.editedAt?.toISOString(),
      owner: {
        ...updatedList.owner,
        id: updatedList.owner.userId?.toString()
      },
      collaborators: updatedList.collaborators?.map((c: { _id?: { toString(): string } } & Record<string, unknown>) => ({
        ...c,
        id: c._id?.toString()
      }))
    };

    return NextResponse.json(responseList);
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

    // Process items to ensure they have valid structure
    const processedItems = items.map((item: ListItem, index: number) => ({
      title: item.title,
      rank: index + 1,
      comment: item.comment,
      properties: (item.properties || []).map(prop => ({
        type: prop.type || 'text',
        label: prop.label || '',
        value: prop.value || ''
      }))
    }));

    // Update list
    const updatedList = await ListModel.findByIdAndUpdate(
      params.listId,
      {
        title,
        description,
        category,
        privacy,
        items: processedItems,
        editedAt: new Date()
      },
      { 
        new: true
      }
    ).lean();

    if (!updatedList) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    // Convert _id to string for the response
    const { _id, ...rest } = updatedList;
    const responseList = {
      ...rest,
      id: _id.toString(),
      createdAt: updatedList.createdAt?.toISOString(),
      updatedAt: updatedList.updatedAt?.toISOString(),
      editedAt: updatedList.editedAt?.toISOString(),
      owner: {
        ...updatedList.owner,
        id: updatedList.owner.userId?.toString()
      },
      collaborators: updatedList.collaborators?.map((c: { _id?: { toString(): string } } & Record<string, unknown>) => ({
        ...c,
        id: c._id?.toString()
      }))
    };

    return NextResponse.json(responseList);
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
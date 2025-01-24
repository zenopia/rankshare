import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getListModel } from "@/lib/db/models-v2/list";
import { canEditList } from "@/lib/auth/permissions";

interface ItemProperty {
  type?: 'text' | 'link';
  label: string;
  value: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: { username: string; listId: string; itemId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { title, comment, properties } = data;

    const ListModel = await getListModel();
    const list = await ListModel.findById(params.listId).lean();

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

    // Find the item by rank
    const itemIndex = list.items?.findIndex(item => item.rank === parseInt(params.itemId));
    if (itemIndex === -1 || itemIndex === undefined) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    // Update the item
    const updatedList = await ListModel.findByIdAndUpdate(
      params.listId,
      {
        $set: {
          [`items.${itemIndex}.title`]: title,
          [`items.${itemIndex}.comment`]: comment,
          [`items.${itemIndex}.properties`]: properties?.map((prop: ItemProperty) => ({
            type: prop.type || 'text',
            label: prop.label,
            value: prop.value
          })),
          editedAt: new Date()
        }
      },
      { new: true }
    ).lean();

    if (!updatedList) {
      return NextResponse.json(
        { error: "Failed to update item" },
        { status: 500 }
      );
    }

    // Get the updated item
    const updatedItem = updatedList.items[itemIndex];

    return NextResponse.json({
      id: Math.random().toString(36).slice(2),
      title: updatedItem.title,
      comment: updatedItem.comment,
      rank: updatedItem.rank,
      properties: updatedItem.properties?.map(prop => ({
        id: Math.random().toString(36).slice(2),
        type: prop.type,
        label: prop.label,
        value: prop.value
      }))
    });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
} 
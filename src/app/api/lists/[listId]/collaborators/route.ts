import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ListModel } from "@/lib/db/models/list";
import connectToDatabase from "@/lib/db/mongodb";
import { ListCollaborator } from "@/types/list";

// Helper function to check if user has permission to manage collaborators
async function hasCollaboratorPermission(listId: string, userId: string) {
  const list = await ListModel.findById(listId);
  if (!list) return false;
  
  // Owner always has permission
  if (list.ownerId === userId) return true;
  
  // Admin has permission
  const userCollaborator = list.collaborators?.find((c: ListCollaborator) => 
    c.userId === userId && c.status === "accepted"
  );
  return userCollaborator?.role === "admin";
}

// GET /api/lists/[listId]/collaborators
export async function GET(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const list = await ListModel.findById(params.listId);
    
    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    // Check if user has access to view collaborators
    const canView = list.privacy === "public" || 
                   list.ownerId === userId ||
                   list.collaborators?.some((c: ListCollaborator) => 
                     c.userId === userId && c.status === "accepted"
                   );

    if (!canView) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure owner is in the collaborators list
    const collaborators = list.collaborators || [];
    const ownerCollaborator = collaborators.find((c: ListCollaborator) => c.userId === list.ownerId && c.role === 'owner');
    
    if (!ownerCollaborator) {
      // Get owner's data from Clerk
      const owner = await clerkClient.users.getUser(list.ownerId);
      
      collaborators.unshift({
        userId: list.ownerId,
        email: owner.emailAddresses[0]?.emailAddress || '',
        imageUrl: owner.imageUrl,
        role: 'owner' as const,
        status: 'accepted' as const,
        invitedAt: list.createdAt,
        acceptedAt: list.createdAt,
      });
    }

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("Error getting collaborators:", error);
    return NextResponse.json(
      { error: "Failed to get collaborators" },
      { status: 500 }
    );
  }
}

// POST /api/lists/[listId]/collaborators
export async function POST(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role = "viewer" } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email or user ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Check if user has permission
    if (!(await hasCollaboratorPermission(params.listId, userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let collaboratorData: Partial<ListCollaborator> = {
      role,
      status: "pending",
      invitedAt: new Date(),
    };

    // If input looks like a Clerk user ID, fetch user details
    if (email.startsWith('user_')) {
      try {
        const user = await clerkClient.users.getUser(email);
        collaboratorData = {
          ...collaboratorData,
          userId: email,
          email: user.emailAddresses[0]?.emailAddress || '',
          imageUrl: user.imageUrl,
          status: "accepted" // Auto-accept for registered users
        };
      } catch (error) {
        console.error('Error fetching Clerk user:', error);
        return NextResponse.json(
          { error: "Invalid user ID" },
          { status: 400 }
        );
      }
    } else {
      // Handle email invitation
      collaboratorData.email = email;
    }

    // Add collaborator
    const list = await ListModel.findByIdAndUpdate(
      params.listId,
      {
        $push: {
          collaborators: collaboratorData,
        },
      },
      { new: true }
    );

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json({ collaborators: list.collaborators });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json(
      { error: "Failed to add collaborator" },
      { status: 500 }
    );
  }
}

// PATCH /api/lists/[listId]/collaborators
export async function PATCH(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collaboratorId, role } = await request.json();
    if (!collaboratorId || !role) {
      return NextResponse.json(
        { error: "Collaborator ID and role are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Check if user has permission
    if (!(await hasCollaboratorPermission(params.listId, userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update collaborator role
    const list = await ListModel.findOneAndUpdate(
      {
        _id: params.listId,
        "collaborators.userId": collaboratorId,
      },
      {
        $set: {
          "collaborators.$.role": role,
        },
      },
      { new: true }
    );

    if (!list) {
      return NextResponse.json({ error: "List or collaborator not found" }, { status: 404 });
    }

    return NextResponse.json({ collaborators: list.collaborators });
  } catch (error) {
    console.error("Error updating collaborator:", error);
    return NextResponse.json(
      { error: "Failed to update collaborator" },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[listId]/collaborators
export async function DELETE(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { collaboratorId } = await request.json();
    if (!collaboratorId) {
      return NextResponse.json(
        { error: "Collaborator ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Check if user has permission
    if (!(await hasCollaboratorPermission(params.listId, userId))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Remove collaborator
    const list = await ListModel.findByIdAndUpdate(
      params.listId,
      {
        $pull: {
          collaborators: { 
            $or: [
              { userId: collaboratorId },
              { email: collaboratorId }
            ]
          },
        },
      },
      { new: true }
    );

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 });
    }

    return NextResponse.json({ collaborators: list.collaborators });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json(
      { error: "Failed to remove collaborator" },
      { status: 500 }
    );
  }
} 
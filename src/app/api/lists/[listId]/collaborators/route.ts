import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth.service";
import { connectToMongoDB } from "@/lib/db/client";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserModel } from "@/lib/db/models-v2/user";
import { MongoListDocument, MongoUserDocument } from "@/types/mongo";
import { sendCollaborationInviteEmail } from "@/lib/email";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function GET(
  request: Request,
  { params }: { params: { listId: string } }
) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await connectToMongoDB();
    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    const list = await ListModel.findById(params.listId).lean();
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Check if user has access to view collaborators
    const hasAccess =
      list.owner.clerkId === user.id ||
      list.collaborators?.some(
        (c) => c.clerkId === user.id && c.status === "accepted"
      );

    if (!hasAccess) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all non-email collaborators' user data
    const collaboratorsWithUserData = await Promise.all((list.collaborators || []).map(async (collaborator) => {
      if (collaborator._isEmailInvite || !collaborator.clerkId) {
        return collaborator;
      }

      const userData = await UserModel.findOne({ clerkId: collaborator.clerkId }).lean();
      if (!userData) {
        return collaborator;
      }

      return {
        ...collaborator,
        username: userData.username,
        displayName: userData.displayName,
        imageUrl: userData.imageUrl
      };
    }));

    return NextResponse.json({ collaborators: collaboratorsWithUserData });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { listId: string } }
) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, userId, username, email, role = "viewer" } = body;

    await connectToMongoDB();
    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    const list = await ListModel.findById(params.listId);
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Check if user has permission to add collaborators
    const canManageCollaborators = 
      list.owner.clerkId === user.id ||
      list.collaborators?.some(
        (c) => c.clerkId === user.id && c.status === "accepted" && c.role === "admin"
      );

    if (!canManageCollaborators) {
      return new NextResponse("Not authorized to add collaborators", { status: 403 });
    }

    if (type === 'email') {
      // Handle email invite
      if (!email) {
        return new NextResponse("Email is required for email invites", { status: 400 });
      }

      // Check if email is already a collaborator
      const existingEmailCollaborator = list.collaborators?.find(
        (c) => c.email === email || (c.clerkId && c.email === email)
      );
      if (existingEmailCollaborator) {
        return new NextResponse("This email is already a collaborator", { status: 400 });
      }

      // Check if the email corresponds to an existing user
      const existingUser = await clerkClient.users.getUserList({
        emailAddress: [email].filter((e): e is string => !!e)
      });

      if (existingUser.length > 0) {
        const clerkUser = existingUser[0];
        const targetUser = await UserModel.findOne({ clerkId: clerkUser.id }).lean();
        
        if (!targetUser) {
          return new NextResponse("User not found", { status: 404 });
        }

        // Add as a regular user collaborator instead of email invite
        const collaborator: {
          userId: any;
          clerkId: string;
          username: string;
          email: string | undefined;
          role: string;
          status: 'accepted';
          invitedAt: Date;
          acceptedAt: Date;
        } = {
          userId: targetUser._id,
          clerkId: clerkUser.id,
          username: clerkUser.username || '',
          email: email,
          role,
          status: 'accepted',
          invitedAt: new Date(),
          acceptedAt: new Date()
        };

        const updatedList = await ListModel.findByIdAndUpdate(
          params.listId,
          {
            $push: {
              collaborators: collaborator
            },
          },
          { new: true }
        );

        return NextResponse.json({
          collaborators: updatedList?.collaborators || [],
        });
      }

      // If no existing user found, proceed with email invite
      const updatedList = await ListModel.findByIdAndUpdate(
        params.listId,
        {
          $push: {
            collaborators: {
              email,
              role,
              status: 'pending',
              _isEmailInvite: true,
              invitedAt: new Date()
            },
          },
        },
        { new: true }
      );

      // Send invitation email
      await sendCollaborationInviteEmail({
        to: email,
        inviterName: user.username || '',
        listTitle: list.title || '',
        listUrl: `${process.env.NEXT_PUBLIC_APP_URL}/lists/${list._id}`
      });

      return NextResponse.json({
        collaborators: updatedList?.collaborators || [],
      });
    } else {
      // Handle user invite
      if (!userId) {
        return new NextResponse("User ID is required for user invites", { status: 400 });
      }

      // Check if user is already a collaborator
      const existingUserCollaborator = list.collaborators?.find(
        (c) => c.clerkId === userId
      );
      if (existingUserCollaborator) {
        return new NextResponse("User is already a collaborator", { status: 400 });
      }

      // Get the target user's MongoDB document
      const targetUser = await UserModel.findOne({ clerkId: userId }).lean();
      if (!targetUser) {
        return new NextResponse("User not found", { status: 404 });
      }

      // Get user's Clerk profile for additional data
      const clerkUser = await clerkClient.users.getUser(userId);

      // Add user collaborator
      const updatedList = await ListModel.findByIdAndUpdate(
        params.listId,
        {
          $push: {
            collaborators: {
              userId: targetUser._id,
              clerkId: userId,
              username,
              role,
              status: 'accepted',
              invitedAt: new Date(),
              acceptedAt: new Date()
            },
          },
        },
        { new: true }
      );

      return NextResponse.json({
        collaborators: updatedList?.collaborators || [],
      });
    }
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 
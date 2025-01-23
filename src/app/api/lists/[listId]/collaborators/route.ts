import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { getListModel } from "@/lib/db/models-v2/list";
import { getUserModel } from "@/lib/db/models-v2/user";
import { MongoListDocument, MongoUserDocument } from "@/types/mongo";
import { sendCollaborationInviteEmail } from "@/lib/email";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function GET(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();
    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    const list = (await ListModel.findById(params.listId).lean()) as unknown as MongoListDocument;
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Check if user has access to the list
    if (list.privacy === "private" && !list.collaborators?.some((c: { clerkId: string }) => c.clerkId === userId) && list.owner.clerkId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get all collaborators including the owner
    const collaborators = [
      { userId: list.owner.clerkId, role: "owner" as const, status: "accepted" as const },
      ...(list.collaborators?.map((c: { 
        clerkId?: string;
        email?: string;
        username?: string;
        role: string;
        status: string;
        _isEmailInvite?: boolean;
        invitedAt?: Date;
        acceptedAt?: Date;
      }) => {
        if (c._isEmailInvite) {
          // Use the data directly from the database
          return {
            userId: c.email,
            username: c.email,
            email: c.email,
            role: c.role,
            status: c.status,
            _isEmailInvite: true,
            invitedAt: c.invitedAt,
            acceptedAt: c.acceptedAt
          };
        }
        return {
          userId: c.clerkId,
          role: c.role,
          status: c.status
        };
      }) || [])
    ];

    // Get user details only for non-email collaborators
    const userCollaborators = collaborators.filter(c => !c._isEmailInvite);
    const users = (await UserModel.find({
      clerkId: { $in: userCollaborators.map(c => c.userId) }
    }).lean()) as unknown as MongoUserDocument[];

    // Combine user details with roles
    const collaboratorDetails = collaborators.map(collab => {
      if (collab._isEmailInvite) {
        return collab;  // Pass through the complete email invite data
      }

      const user = users.find((u: MongoUserDocument) => u.clerkId === collab.userId);
      return {
        userId: collab.userId,
        username: user?.username || "",
        role: collab.role,
        status: collab.status
      };
    });

    return NextResponse.json(collaboratorDetails);
  } catch (error) {
    console.error("[LISTS_COLLABORATORS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { listId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { email, userId: targetUserId, role, note } = await req.json();

    await connectToDatabase();
    const ListModel = await getListModel();
    const UserModel = await getUserModel();

    const list = (await ListModel.findById(params.listId).lean()) as unknown as MongoListDocument;
    if (!list) {
      return new NextResponse("List not found", { status: 404 });
    }

    // Only owner can add collaborators
    if (list.owner.clerkId !== userId && !list.collaborators?.some(c => 
      c.clerkId === userId && 
      c.status === 'accepted' && 
      c.role === 'admin'
    )) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get inviter's details
    const inviter = await UserModel.findOne({ clerkId: userId }).lean();
    if (!inviter) {
      return new NextResponse("Inviter not found", { status: 404 });
    }

    if (email) {
      // First check if a user with this email exists in Clerk
      const users = await clerkClient.users.getUserList({
        emailAddress: [email]
      });
      const existingUser = users[0];

      if (existingUser) {
        // If user exists, add them as a regular collaborator
        const collaborator = await UserModel.findOne({ clerkId: existingUser.id }).lean();
        if (!collaborator) {
          return new NextResponse("User not found in our database", { status: 404 });
        }

        // Check if user is already a collaborator
        if (list.collaborators?.some((c: { clerkId: string }) => c.clerkId === collaborator.clerkId)) {
          return new NextResponse("User is already a collaborator", { status: 400 });
        }

        // Add user collaborator
        await ListModel.findByIdAndUpdate(
          params.listId,
          {
            $push: {
              collaborators: {
                clerkId: collaborator.clerkId,
                username: collaborator.username,
                role: role as "editor" | "viewer",
                status: "accepted",
                invitedAt: new Date(),
                acceptedAt: new Date()
              }
            }
          },
          { new: true }
        ).lean();

        // Return the new collaborator details
        return NextResponse.json({
          userId: collaborator.clerkId,
          username: collaborator.username,
          role: role as "editor" | "viewer",
          status: "accepted"
        });
      }

      // If no existing user found, proceed with email invite flow
      // Check if email is already a collaborator
      if (list.collaborators?.some((c: { email?: string; _isEmailInvite?: boolean; username?: string }) => 
        c.email === email || (c._isEmailInvite && c.username === email)
      )) {
        return new NextResponse("This email has already been invited", { status: 400 });
      }

      // Add email collaborator
      await ListModel.findByIdAndUpdate(
        params.listId,
        {
          $push: {
            collaborators: {
              email,
              role: role as "editor" | "viewer",
              status: "pending",
              invitedAt: new Date(),
              _isEmailInvite: true
            }
          }
        },
        { new: true }
      ).lean();

      // Send invitation email
      const listUrl = `${process.env.NEXT_PUBLIC_APP_URL}/lists/${params.listId}`;
      console.log('Sending invitation with URLs:', {
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
        listUrl
      });
      await sendCollaborationInviteEmail({
        to: email,
        inviterName: inviter.displayName || inviter.username,
        listTitle: list.title,
        listUrl,
        note
      });

      // Return the new collaborator details
      return NextResponse.json({
        userId: email, // Use email as userId for email invites
        username: email, // Use email as username for display
        email: email, // Add email field for email invites
        role: role as "editor" | "viewer",
        status: "pending",
        _isEmailInvite: true
      });
    } else if (targetUserId) {
      // User invite flow
      // Find user in our database
      const collaborator = (await UserModel.findOne({ clerkId: targetUserId }).lean()) as unknown as MongoUserDocument;
      if (!collaborator) {
        return new NextResponse("User not found in our database", { status: 404 });
      }

      // Check if user is already a collaborator
      if (list.collaborators?.some((c: { clerkId: string }) => c.clerkId === collaborator.clerkId)) {
        return new NextResponse("User is already a collaborator", { status: 400 });
      }

      // Add user collaborator
      await ListModel.findByIdAndUpdate(
        params.listId,
        {
          $push: {
            collaborators: {
              clerkId: collaborator.clerkId,
              username: collaborator.username,
              role: role as "editor" | "viewer",
              status: "accepted",
              invitedAt: new Date(),
              acceptedAt: new Date()
            }
          }
        },
        { new: true }
      ).lean();

      // Return the new collaborator details
      return NextResponse.json({
        userId: collaborator.clerkId,
        username: collaborator.username,
        role: role as "editor" | "viewer",
        status: "accepted"
      });
    }

    return new NextResponse("Invalid request - must provide either email or userId", { status: 400 });
  } catch (error) {
    console.error("[LISTS_COLLABORATORS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 
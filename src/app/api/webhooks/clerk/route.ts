import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';
import { connectToMongoDB } from '@/lib/db/client';
import { getUserModel } from '@/lib/db/models-v2/user';
import { getUserCacheModel } from '@/lib/db/models-v2/user-cache';
import { getListModel } from '@/lib/db/models-v2/list';
import { getFollowModel } from '@/lib/db/models-v2/follow';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.updated') {
    const { id, username, first_name, last_name, image_url, email_addresses } = evt.data;
    const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id)?.email_address;
    
    try {
      await connectToMongoDB();
      const [UserModel, UserCacheModel, ListModel, FollowModel] = await Promise.all([
        getUserModel(),
        getUserCacheModel(),
        getListModel(),
        getFollowModel()
      ]);

      // Update the main user record
      const displayName = `${first_name || ''} ${last_name || ''}`.trim() || username || '';
      await UserModel.updateOne(
        { clerkId: id },
        { 
          $set: { 
            username: username || '',
            displayName,
            searchIndex: `${username} ${displayName}`.toLowerCase(),
            email: primaryEmail
          }
        }
      );

      // Update user cache
      await UserCacheModel.updateOne(
        { clerkId: id },
        {
          $set: {
            username: username || '',
            displayName,
            imageUrl: image_url,
            lastSynced: new Date()
          }
        },
        { upsert: true }
      );

      // Update lists where user is owner or collaborator
      await ListModel.updateMany(
        { 'owner.clerkId': id },
        { 
          $set: { 
            'owner.username': username || ''
          }
        }
      );

      await ListModel.updateMany(
        { 'collaborators.clerkId': id },
        { 
          $set: { 
            'collaborators.$.username': username || ''
          }
        }
      );

      // Update follows
      await FollowModel.updateMany(
        { followerId: id },
        {
          $set: {
            'followerInfo.username': username || '',
            'followerInfo.displayName': displayName
          }
        }
      );

      await FollowModel.updateMany(
        { followingId: id },
        {
          $set: {
            'followingInfo.username': username || '',
            'followingInfo.displayName': displayName
          }
        }
      );

      return new NextResponse('Success', { status: 200 });
    } catch (error) {
      console.error('Error updating user data:', error);
      return new NextResponse('Error updating user data', { status: 500 });
    }
  }

  return new NextResponse('Success', { status: 200 });
} 
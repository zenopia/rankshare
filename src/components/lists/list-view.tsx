"use client";

import { useState } from "react";
import { List } from "@/types/list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Share2, Trash2, Pin, PinOff, UserPlus, UserMinus, Copy } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ListViewProps {
  list: List;
  isOwner?: boolean;
  isPinned?: boolean;
  hasUpdate?: boolean;
  isFollowing?: boolean;
}

export function ListView({ list, isOwner, isPinned, hasUpdate, isFollowing }: ListViewProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const deleteList = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/lists/${list.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete list');
      }

      toast.success('List deleted successfully');
      router.push('/my-lists');
      router.refresh();
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    } finally {
      setIsDeleting(false);
    }
  };

  const togglePin = async () => {
    try {
      setIsPinning(true);
      const response = await fetch(`/api/lists/${list.id}/pin`, {
        method: isPinned ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error(isPinned ? 'Failed to unpin list' : 'Failed to pin list');
      }

      toast.success(isPinned ? 'List unpinned' : 'List pinned');
      router.refresh();
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update pin');
    } finally {
      setIsPinning(false);
    }
  };

  const toggleFollow = async () => {
    try {
      setIsFollowingUser(true);
      const response = await fetch(`/api/users/${list.ownerId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error(isFollowing ? 'Failed to unfollow user' : 'Failed to follow user');
      }

      toast.success(isFollowing ? 'Unfollowed user' : 'Following user');
      router.refresh();
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update follow');
    } finally {
      setIsFollowingUser(false);
    }
  };

  const copyList = async () => {
    try {
      setIsCopying(true);
      const response = await fetch(`/api/lists/${list.id}/copy`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to copy list');
      }

      const newList = await response.json();
      toast.success('List copied successfully! You can now edit your copy.');
      router.push(`/lists/${newList.id}/edit`);
      router.refresh();
    } catch (error) {
      console.error('Error copying list:', error);
      toast.error('Failed to copy list');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-0">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">{list.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Created by {list.ownerName}
            </p>
            {list.description && (
              <p className="mt-2 text-gray-600">{list.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isOwner && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={togglePin}
                disabled={isPinning}
                className={hasUpdate ? 'relative' : ''}
              >
                {isPinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin
                  </>
                )}
                {hasUpdate && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full" />
                )}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {!isOwner && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleFollow}
                disabled={isFollowingUser}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4 mr-2" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            )}
            {!isOwner && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyList}
                disabled={isCopying}
              >
                <Copy className="h-4 w-4 mr-2" />
                {isCopying ? 'Copying...' : 'Copy'}
              </Button>
            )}
            {isOwner && (
              <>
                <Link href={`/lists/${list.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={isDeleting}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete List</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this list? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteList}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{list.category}</span>
          <span>•</span>
          <span>{list.viewCount} views</span>
        </div>
      </div>

      <div className="space-y-4">
        {list.items?.map((item) => (
          <div 
            key={`${item.rank}-${item.title}`}
            className="p-4 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl font-bold text-muted-foreground">
                {item.rank}
              </span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                {item.comment && (
                  <p className="mt-1 text-sm text-gray-600">{item.comment}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
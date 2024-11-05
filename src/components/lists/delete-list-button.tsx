"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
import { useRouter } from "next/navigation";

interface DeleteListButtonProps {
  listId: string;
}

function DeleteAlertDialog({ onDelete, isDeleting }: { onDelete: () => void, isDeleting: boolean }) {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete List</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to delete this list? This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

export function DeleteListButton({ listId }: DeleteListButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      
      router.push('/my-lists');
      router.refresh();
    } catch (error) {
      console.error('Error deleting list:', error);
      setIsDeleting(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline"
                size="default"
                className="w-10 h-10 p-0"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete list</span>
              </Button>
            </AlertDialogTrigger>
            <DeleteAlertDialog onDelete={handleDelete} isDeleting={isDeleting} />
          </AlertDialog>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete list</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 
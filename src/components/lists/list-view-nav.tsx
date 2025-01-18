"use client"

import { ArrowLeft, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ListViewNavProps {
  returnPath?: string;
  title: string;
  onCollaboratorsClick?: () => void;
  showCollaborators?: boolean;
  isOwner?: boolean;
}

export function ListViewNav({ 
  returnPath, 
  title,
  onCollaboratorsClick,
  showCollaborators,
  isOwner 
}: ListViewNavProps) {
  const router = useRouter()

  const handleBack = () => {
    if (returnPath) {
      router.push(returnPath)
    } else {
      // If no return path is provided, go to home
      router.push('/')
    }
  }

  return (
    <div className="flex items-center justify-between h-14 px-4 border-b">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      </div>
      
      {isOwner && (
        <Button
          variant="outline"
          size="icon"
          onClick={onCollaboratorsClick}
          className={cn(
            "border",
            showCollaborators && "bg-accent"
          )}
        >
          <UserPlus className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
} 
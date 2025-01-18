"use client"

import { ArrowLeft, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUsers } from "@/hooks/use-users"
import { ListCollaborator } from "@/types/list"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ListViewNavProps {
  returnPath?: string;
  title: string;
  onCollaboratorsClick?: () => void;
  showCollaborators?: boolean;
  isOwner?: boolean;
  isCollaborator?: boolean;
  collaborators?: ListCollaborator[];
}

export function ListViewNav({ 
  returnPath, 
  title,
  onCollaboratorsClick,
  showCollaborators,
  isOwner,
  isCollaborator,
  collaborators = []
}: ListViewNavProps) {
  const router = useRouter()
  const acceptedCollaborators = collaborators.filter(c => c.status === 'accepted')
  const { data: userData } = useUsers(acceptedCollaborators.map(c => c.clerkId).filter((id): id is string => !!id))

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
      
      {(isOwner || isCollaborator) && (
        <div className="flex items-center">
          {acceptedCollaborators.length > 0 && userData && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex -space-x-3 mr-2 hover:space-x-1 transition-all">
                    {userData.map((user) => (
                      <Avatar key={user.id} className="h-6 w-6 border-2 border-background ring-0">
                        <AvatarImage src={user.imageUrl ?? undefined} alt={user.username || ''} />
                        <AvatarFallback>{user.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    {userData.map(u => u.username).join(', ')}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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
        </div>
      )}
    </div>
  )
} 
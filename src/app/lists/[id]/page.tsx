import { auth } from "@clerk/nextjs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ListModel } from "@/lib/db/models/list";
import { PinModel } from "@/lib/db/models/pin";
import dbConnect from "@/lib/db/mongodb";
import type { ListDocument } from "@/types/list";
import type { Pin } from "@/types/pin";
import { serializeList } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PinButton } from "@/components/ui/pin-button";
import { CopyListButton } from "@/components/ui/copy-list-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Pencil } from "lucide-react";

export default async function ListPage({ params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { userId } = await auth();

    const list = await ListModel.findById(params.id).lean() as ListDocument;
    
    if (!list) {
      notFound();
    }

    // Update view count
    await ListModel.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } });

    // Get pin if user is logged in
    let pin = null;
    if (userId) {
      pin = await PinModel.findOne({ 
        userId, 
        listId: params.id 
      }).lean() as Pin | null;
    }

    // Serialize the list data
    const serializedList = {
      ...serializeList(list),
      hasUpdate: false, // Since we're viewing it now
      isOwner: userId === list.ownerId,
      isPinned: !!pin,
    };

    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{serializedList.title}</h1>
              <p className="text-muted-foreground">
                Created by {serializedList.ownerName} • {serializedList.viewCount} views
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {userId && (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <PinButton 
                            listId={serializedList.id} 
                            isPinned={serializedList.isPinned} 
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{serializedList.isPinned ? 'Unpin list' : 'Pin list'}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <CopyListButton listId={serializedList.id} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy list</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}
              
              {serializedList.isOwner && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={`/lists/${params.id}/edit`}>
                        <Button 
                          variant="outline"
                          size="default"
                          className="w-10 h-10 p-0"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit list</span>
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit list</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          {serializedList.description && (
            <p className="mb-8 text-muted-foreground">
              {serializedList.description}
            </p>
          )}

          <div className="space-y-4">
            {serializedList.items.map((item, index) => (
              <div 
                key={item.id || index}
                className="bg-card p-4 rounded-lg border"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    {item.comment && (
                      <p className="text-muted-foreground mt-1">
                        {item.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching list:', error);
    notFound();
  }
} 
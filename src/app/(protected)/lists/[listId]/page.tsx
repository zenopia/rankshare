import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getListById } from "@/lib/actions/list.actions";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

interface ListDetailPageProps {
  params: {
    listId: string;
  };
}

export default async function ListDetailPage({ params }: ListDetailPageProps) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const list = await getListById(params.listId);
  
  if (!list) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">List not found</h1>
        <p className="text-muted-foreground">
          The list you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>
      </div>
    );
  }

  // Check if user has access to this list
  const canAccess = 
    list.owner.clerkId === user.id || 
    list.privacy === 'public' ||
    list.collaborators?.some(
      collab => collab.clerkId === user.id && collab.status === 'accepted'
    );

  if (!canAccess) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Access denied</h1>
        <p className="text-muted-foreground">
          You don&apos;t have permission to view this list.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">{list.title}</h1>
      {list.description && (
        <p className="text-muted-foreground mb-6">{list.description}</p>
      )}
      
      <div className="space-y-4">
        {list.items.map((item) => (
          <div 
            key={item.id}
            className="p-4 rounded-lg border bg-card text-card-foreground"
          >
            <h3 className="font-medium">{item.title}</h3>
            {item.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 
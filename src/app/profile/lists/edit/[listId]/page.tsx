import { redirect } from "next/navigation";
import { AuthService } from "@/lib/services/auth.service";
import { ListFormContent } from "@/components/lists/list-form-content";
import { ProtectedPageWrapper } from "@/components/auth/protected-page-wrapper";
import { getList } from "@/lib/actions/list";

interface PageProps {
  params: {
    listId: string;
  };
}

export default async function EditListPage({ params }: PageProps) {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  try {
    const list = await getList(params.listId);

    // Check if user is owner or editor
    const isOwner = list.owner.clerkId === user.id;
    const isEditor = list.collaborators?.some(
      (c) => c.clerkId === user.id && c.status === "accepted" && c.role === "editor"
    );

    if (!isOwner && !isEditor) {
      redirect('/');
    }

    // Prepare form values
    const formValues = {
      id: list.id,
      title: list.title,
      description: list.description,
      category: list.category,
      privacy: list.privacy,
      items: list.items || [],
      owner: {
        username: list.owner.username
      }
    };

    return (
      <ProtectedPageWrapper
        initialUser={{
          id: user.id,
          username: user.username || null,
          fullName: user.fullName || null,
          imageUrl: user.imageUrl || "",
        }}
        layoutType="main"
        title="Edit List"
      >
        <div className="px-4 md:px-6 lg:px-8 py-8">
          <div className="max-w-3xl mx-auto">
            <ListFormContent mode="edit" defaultValues={formValues} />
          </div>
        </div>
      </ProtectedPageWrapper>
    );
  } catch (error) {
    console.error('Error loading list:', error);
    redirect('/');
  }
} 
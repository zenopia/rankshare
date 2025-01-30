import { redirect } from "next/navigation";
import { AuthService } from "@/lib/services/auth.service";
import { ListFormContent } from "@/components/lists/list-form-content";
import { ProtectedPageWrapper } from "@/components/auth/protected-page-wrapper";

export default async function CreateListPage() {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <ProtectedPageWrapper
      initialUser={{
        id: user.id,
        username: user.username || null,
        fullName: user.fullName || null,
        imageUrl: user.imageUrl || "",
      }}
      layoutType="main"
      title="Create List"
    >
      <div className="px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <ListFormContent mode="create" />
        </div>
      </div>
    </ProtectedPageWrapper>
  );
} 
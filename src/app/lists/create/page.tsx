import { ProtectedRoute } from "@/components/auth/protected-route";
import { ListForm } from "@/components/lists/list-form";
import { ListFormHeader } from "@/components/lists/list-form-header";
import { ErrorBoundary } from "@/components/error-boundary";

export default function CreateListPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <ListFormHeader mode="create" />
        <ErrorBoundary>
          <ListForm />
        </ErrorBoundary>
      </div>
    </ProtectedRoute>
  );
} 
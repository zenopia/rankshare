import { ProtectedRoute } from "@/components/auth/protected-route";
import { ListForm } from "@/components/lists/list-form";
import { ErrorBoundary } from "@/components/error-boundary";

export default function CreateListPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-8">Create New List</h1>
        <ErrorBoundary>
          <ListForm />
        </ErrorBoundary>
      </div>
    </ProtectedRoute>
  );
} 
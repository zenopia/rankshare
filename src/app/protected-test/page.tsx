import { ProtectedRoute } from "@/components/auth/protected-route";

export default function ProtectedTestPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Protected Page</h1>
          <p>If you can see this, you&apos;re authenticated!</p>
        </div>
      </div>
    </ProtectedRoute>
  );
} 
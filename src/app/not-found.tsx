import { MainLayout } from "@/components/layout/main-layout";

// Force dynamic to prevent static build issues
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function NotFound() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
    </MainLayout>
  );
} 
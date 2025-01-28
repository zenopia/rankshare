import { MainLayout } from "@/components/layout/main-layout";
import { HomePage } from "@/components/home/home-page";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function Page() {
  return (
    <MainLayout>
      <HomePage />
    </MainLayout>
  );
}

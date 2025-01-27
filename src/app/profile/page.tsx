
import { ProfilePage } from "@/components/profile/profile-page";

export default async function Page() {
  // Let middleware handle auth
  return <ProfilePage />;
} 
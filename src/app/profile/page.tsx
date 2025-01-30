import { redirect } from "next/navigation";
import { AuthService } from "@/lib/services/auth.service";
import { ProfilePage } from "@/components/profile/profile-page";

export default async function Page() {
  const user = await AuthService.getCurrentUser();
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <ProfilePage 
      initialUser={{
        id: user.id,
        username: user.username || null,
        fullName: user.fullName || null,
        imageUrl: user.imageUrl || "",
      }} 
    />
  );
} 
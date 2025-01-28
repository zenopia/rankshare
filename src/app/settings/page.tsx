import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NotificationPreferences } from "@/components/settings/notification-preferences";

export default async function SettingsPage() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <NotificationPreferences />
        </section>
      </div>
    </div>
  );
} 
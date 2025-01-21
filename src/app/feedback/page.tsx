import { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { SubLayout } from "@/components/layout/sub-layout";

export const metadata: Metadata = {
  title: "Feedback - Favely",
  description: "Submit feedback to help us improve Favely",
};

export default async function FeedbackPage() {
  const user = await currentUser();

  return (
    <SubLayout title="Feedback">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Feedback</h1>
          <p className="text-muted-foreground mt-2">
            Help us improve Favely by sharing your thoughts and suggestions
          </p>
        </div>
        <FeedbackForm 
          userId={user?.id} 
          username={user?.username || undefined}
        />
      </div>
    </SubLayout>
  );
} 
"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

interface NotificationSettings {
  email: {
    collaborationInvites: boolean;
    collaborationUpdates: boolean;
    listActivity: boolean;
    mentions: boolean;
  };
  push: {
    collaborationInvites: boolean;
    collaborationUpdates: boolean;
    listActivity: boolean;
    mentions: boolean;
  };
}

export function NotificationPreferences() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      collaborationInvites: true,
      collaborationUpdates: true,
      listActivity: true,
      mentions: true
    },
    push: {
      collaborationInvites: true,
      collaborationUpdates: true,
      listActivity: true,
      mentions: true
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user's notification preferences
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences");
        if (!response.ok) throw new Error("Failed to fetch preferences");
        const data = await response.json();
        setSettings(data.notifications);
      } catch (error) {
        console.error("Error fetching preferences:", error);
        toast({
          title: "Error",
          description: "Failed to load notification preferences",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [toast]);

  const updatePreference = async (type: "email" | "push", key: keyof NotificationSettings["email"], value: boolean) => {
    try {
      const newSettings = {
        ...settings,
        [type]: {
          ...settings[type],
          [key]: value
        }
      };

      const response = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications: newSettings
        })
      });

      if (!response.ok) throw new Error("Failed to update preferences");

      setSettings(newSettings);
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>
          Choose how you want to be notified about different events.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="email">
          <TabsList>
            <TabsTrigger value="email">Email Notifications</TabsTrigger>
            <TabsTrigger value="push">Push Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="email">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-collab-invites">Collaboration Invites</Label>
                <Switch
                  id="email-collab-invites"
                  checked={settings.email.collaborationInvites}
                  onCheckedChange={(checked) => updatePreference("email", "collaborationInvites", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-collab-updates">Collaboration Updates</Label>
                <Switch
                  id="email-collab-updates"
                  checked={settings.email.collaborationUpdates}
                  onCheckedChange={(checked) => updatePreference("email", "collaborationUpdates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-list-activity">List Activity</Label>
                <Switch
                  id="email-list-activity"
                  checked={settings.email.listActivity}
                  onCheckedChange={(checked) => updatePreference("email", "listActivity", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-mentions">Mentions</Label>
                <Switch
                  id="email-mentions"
                  checked={settings.email.mentions}
                  onCheckedChange={(checked) => updatePreference("email", "mentions", checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="push">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="push-collab-invites">Collaboration Invites</Label>
                <Switch
                  id="push-collab-invites"
                  checked={settings.push.collaborationInvites}
                  onCheckedChange={(checked) => updatePreference("push", "collaborationInvites", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-collab-updates">Collaboration Updates</Label>
                <Switch
                  id="push-collab-updates"
                  checked={settings.push.collaborationUpdates}
                  onCheckedChange={(checked) => updatePreference("push", "collaborationUpdates", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-list-activity">List Activity</Label>
                <Switch
                  id="push-list-activity"
                  checked={settings.push.listActivity}
                  onCheckedChange={(checked) => updatePreference("push", "listActivity", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="push-mentions">Mentions</Label>
                <Switch
                  id="push-mentions"
                  checked={settings.push.mentions}
                  onCheckedChange={(checked) => updatePreference("push", "mentions", checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 
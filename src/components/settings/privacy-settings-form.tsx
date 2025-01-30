"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PrivacySettings {
  showBio?: boolean;
  showLocation?: boolean;
  showDateOfBirth?: boolean;
  showGender?: boolean;
  showLivingStatus?: boolean;
}

interface PrivacySettingsFormProps {
  initialSettings: PrivacySettings;
  userId: string;
}

export function PrivacySettingsForm({ initialSettings, userId }: PrivacySettingsFormProps) {
  const [settings, setSettings] = useState<PrivacySettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/users/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      toast.success('Privacy settings updated successfully');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}>
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Bio</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your bio on your profile
              </p>
            </div>
            <Switch
              checked={settings.showBio}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showBio: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Location</Label>
              <p className="text-sm text-muted-foreground">
                Display your location on your profile
              </p>
            </div>
            <Switch
              checked={settings.showLocation}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLocation: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use Date of Birth</Label>
              <p className="text-sm text-muted-foreground">
                Show your age on your profile
              </p>
            </div>
            <Switch
              checked={settings.showDateOfBirth}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showDateOfBirth: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Gender</Label>
              <p className="text-sm text-muted-foreground">
                Display your gender on your profile
              </p>
            </div>
            <Switch
              checked={settings.showGender}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showGender: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Living Status</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your living status
              </p>
            </div>
            <Switch
              checked={settings.showLivingStatus}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showLivingStatus: checked }))}
            />
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </form>
  );
} 
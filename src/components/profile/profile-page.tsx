"use client";

import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { User } from "@/types/user";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Image from "next/image";
import { z } from "zod";
import { MainLayout } from "@/components/layout/main-layout";
import Link from "next/link";

// First, let's create a type for the privacy settings keys
type PrivacySettingKey = 'showBio' | 'showLocation' | 'showDateOfBirth' | 'showGender' | 'showLivingStatus';

// Remove validation schema since fields are no longer required
const profileSchema = z.object({
  location: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  livingStatus: z.enum(['single', 'couple', 'family', 'shared', 'other']).optional(),
});

export function ProfilePage() {
  const { signOut, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { openUserProfile } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [profileData, setProfileData] = useState<Partial<User>>({
    bio: "",
    location: "",
    dateOfBirth: undefined,
    gender: undefined,
    livingStatus: undefined,
    privacySettings: {
      showBio: true,
      showLocation: true,
      showDateOfBirth: false,
      showGender: true,
      showLivingStatus: true,
    },
  });

  // Check if profile is complete
  useEffect(() => {
    async function checkProfile() {
      try {
        const token = await getToken();
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const { user, profile } = await response.json();
        
        if (user) {
          setProfileData({
            bio: profile?.bio || "",
            location: profile?.location || "",
            dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
            gender: profile?.gender || undefined,
            livingStatus: profile?.livingStatus || undefined,
            privacySettings: {
              showBio: true,
              showLocation: true,
              showDateOfBirth: false,
              showGender: true,
              showLivingStatus: true,
              ...(profile?.privacySettings || {}),
            },
          });
          setIsProfileComplete(profile?.profileComplete ?? false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      }
    }

    if (clerkUser) {
      checkProfile();
    }
  }, [clerkUser, getToken]);

  // Handle normal sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error during sign out:', error);
      toast.error('Failed to sign out');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      profileSchema.parse({
        location: profileData.location,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        livingStatus: profileData.livingStatus,
      });

      const token = await getToken();
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const { user } = await response.json();
      
      if (user) {
        toast.success('Profile updated successfully');
        
        // Redirect back to the original page if returnUrl exists, otherwise go to homepage
        if (returnUrl) {
          router.push(decodeURIComponent(returnUrl));
        } else {
          router.push('/');
        }
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          toast.error(err.message);
        });
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update form fields
  const handleChange = (field: keyof User, value: User[keyof User]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Update privacy settings
  const handlePrivacyChange = (field: PrivacySettingKey, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      privacySettings: {
        ...(prev.privacySettings || {}),
        [field]: value,
      } as Required<User['privacySettings']>,
    }));
  };

  if (!clerkUser) return null;

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 px-4 sm:px-6 lg:px-8 gap-4 border-b">
            <Link 
              href={`/${clerkUser.username}`}
              className="flex items-center gap-6 hover:opacity-80 transition-opacity"
            >
              <Image
                src={clerkUser.imageUrl}
                alt={clerkUser.username || "Profile"}
                width={64}
                height={64}
                className="rounded-full"
              />
              <div>
                <h2 className="text-xl font-semibold">
                  {clerkUser.fullName || clerkUser.username}
                </h2>
                <p className="text-sm text-muted-foreground">
                  @{clerkUser.username}
                </p>
              </div>
            </Link>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => openUserProfile()}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Account</span>
              </Button>
              <Button 
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>

          {/* Profile Sections */}
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Bio Section */}
            <div className="py-6 border-b">
              <h3 className="text-lg font-semibold mb-1">Bio. (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {!isProfileComplete 
                  ? "Optional - You can add this later" 
                  : "Tell others about yourself"
                }
              </p>
              <Textarea
                value={profileData.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Write a short bio..."
                className="min-h-[100px]"
                maxLength={300}
              />
              <div className="text-xs text-muted-foreground text-right mt-1">
                {(profileData.bio?.length || 0)}/300
              </div>
            </div>

            {/* Location Section */}
            <div className="py-6 border-b">
              <h3 className="text-lg font-semibold mb-1">Location</h3>
              <p className="text-sm text-muted-foreground mb-4">Where are you based?</p>
              <div className="space-y-2">
                <Input
                  value={profileData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Enter your location"
                />
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="py-6 border-b">
              <h3 className="text-lg font-semibold mb-1">Personal Details</h3>
              <p className="text-sm text-muted-foreground mb-4">Optional information to help personalize your experience</p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    type="date"
                    id="dob"
                    value={profileData.dateOfBirth 
                      ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] 
                      : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange('dateOfBirth', value ? new Date(value) : undefined);
                    }}
                    className="[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:grayscale [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profileData.gender || ''}
                    onValueChange={(value) => handleChange('gender', value)}
                  >
                    <SelectTrigger 
                      className="bg-background"
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="living-status">Living Status</Label>
                  <Select
                    value={profileData.livingStatus || ''}
                    onValueChange={(value) => handleChange('livingStatus', value)}
                  >
                    <SelectTrigger 
                      className="bg-background"
                    >
                      <SelectValue placeholder="Select living status" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="couple">Couple</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            {isProfileComplete && (
              <div className="py-6 border-b">
                <h3 className="text-lg font-semibold mb-1">Privacy Settings</h3>
                <p className="text-sm text-muted-foreground mb-4">Control what others can see</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Bio</Label>
                      <p className="text-sm text-muted-foreground">
                        Make your bio visible to others
                      </p>
                    </div>
                    <Switch
                      checked={profileData.privacySettings?.showBio ?? true}
                      onCheckedChange={(value) => handlePrivacyChange('showBio', value)}
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
                      checked={profileData.privacySettings?.showLocation ?? true}
                      onCheckedChange={(value) => handlePrivacyChange('showLocation', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Age</Label>
                      <p className="text-sm text-muted-foreground">
                        Share your age
                      </p>
                    </div>
                    <Switch
                      checked={profileData.privacySettings?.showDateOfBirth ?? false}
                      onCheckedChange={(value) => handlePrivacyChange('showDateOfBirth', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Gender</Label>
                      <p className="text-sm text-muted-foreground">
                        Share your gender
                      </p>
                    </div>
                    <Switch
                      checked={profileData.privacySettings?.showGender ?? false}
                      onCheckedChange={(value) => handlePrivacyChange('showGender', value)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Living Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Share your living status
                      </p>
                    </div>
                    <Switch
                      checked={profileData.privacySettings?.showLivingStatus ?? false}
                      onCheckedChange={(value) => handlePrivacyChange('showLivingStatus', value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky footer with save button */}
        <div className="sticky bottom-0 border-t bg-background py-4">
          <div className="px-4 sm:px-6 lg:px-8">
            <Button 
              type="button"
              size="lg"
              disabled={isLoading}
              onClick={handleSubmit}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  {!isProfileComplete ? 'Creating Profile...' : 'Saving Changes...'}
                </>
              ) : (
                !isProfileComplete ? 'Create Profile & Continue' : 'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
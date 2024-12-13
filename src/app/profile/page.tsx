"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { User } from "@/types/user";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);

// First, let's create a type for the privacy settings keys
type PrivacySettingKey = 'showBio' | 'showLocation' | 'showDateOfBirth' | 'showGender' | 'showLivingStatus';

// Add validation schema
const profileSchema = z.object({
  location: z.string().min(1, "Location is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
    required_error: "Gender is required",
  }),
  livingStatus: z.enum(['single', 'couple', 'family', 'shared', 'other'], {
    required_error: "Living status is required",
  }),
});

export default function ProfilePage() {
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('return_to') ?? '/';
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
    } as Required<User['privacySettings']>,
  });
  const { openUserProfile } = useClerk();

  // Check if profile is complete
  useEffect(() => {
    async function checkProfile() {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data = await response.json();
        console.log('Profile data:', data);
        
        const formattedData = {
          ...data,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        };
        
        setIsProfileComplete(data.isProfileComplete);
        setProfileData(formattedData);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      }
    }

    if (clerkUser) {
      checkProfile();
    }
  }, [clerkUser]);

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

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedProfile = await response.json();
      
      if (updatedProfile.isProfileComplete) {
        toast.success('Profile updated successfully');
        router.push(returnTo);
      } else {
        toast.error('Please fill in all required fields');
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

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (!clerkUser) return null;

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="container py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                {!isProfileComplete ? 'Complete Your Profile' : 'Profile'}
              </h1>
              {!isProfileComplete && (
                <p className="text-muted-foreground mt-2">
                  Please complete your profile to continue
                </p>
              )}
            </div>
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
          
          {/* Profile Header Card */}
          <Card>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between py-6 gap-4">
              <div className="flex items-center gap-6">
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
              </div>
              <Button 
                variant="outline"
                onClick={() => openUserProfile()}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Account</span>
              </Button>
            </CardContent>
          </Card>

          {/* Profile Sections */}
          <div className="grid gap-6">
            {/* Bio Section */}
            <Card>
              <CardHeader>
                <CardTitle>Bio</CardTitle>
                <CardDescription>
                  {!isProfileComplete 
                    ? "Optional - You can add this later" 
                    : "Tell others about yourself"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={profileData.bio || ''}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Write a short bio..."
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>

            {/* Location Section */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>Where are you based?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Input
                    value={profileData.location || ''}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Enter your location"
                    required
                    className={!profileData.location ? "border-destructive" : ""}
                  />
                  {!profileData.location && (
                    <p className="text-sm text-destructive">Location is required</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Details Section */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Required information for better results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    type="date"
                    id="dob"
                    value={profileData.dateOfBirth 
                      ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] 
                      : ''
                    }
                    onChange={(e) => handleChange('dateOfBirth', new Date(e.target.value))}
                    required
                    className={!profileData.dateOfBirth ? "border-destructive" : ""}
                  />
                  {!profileData.dateOfBirth && (
                    <p className="text-sm text-destructive">Date of birth is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={profileData.gender || ''}
                    onValueChange={(value) => handleChange('gender', value)}
                    required
                  >
                    <SelectTrigger 
                      className={cn(
                        "bg-background",
                        !profileData.gender ? "border-destructive" : ""
                      )}
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
                  {!profileData.gender && (
                    <p className="text-sm text-destructive">Gender is required</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="living-status">Living Status *</Label>
                  <Select
                    value={profileData.livingStatus || ''}
                    onValueChange={(value) => handleChange('livingStatus', value)}
                    required
                  >
                    <SelectTrigger 
                      className={cn(
                        "bg-background",
                        !profileData.livingStatus ? "border-destructive" : ""
                      )}
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
                  {!profileData.livingStatus && (
                    <p className="text-sm text-destructive">Living status is required</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            {isProfileComplete && (
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Control what others can see</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                      <Label>Show Personal Details</Label>
                      <p className="text-sm text-muted-foreground">
                        Share your personal information
                      </p>
                    </div>
                    <Switch
                      checked={profileData.privacySettings?.showDateOfBirth ?? false}
                      onCheckedChange={(value) => handlePrivacyChange('showDateOfBirth', value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Sticky footer with save button */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background py-4">
        <div className="container flex justify-end max-w-4xl">
          <Button 
            type="submit" 
            size="lg"
            disabled={isLoading}
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
    </form>
  );
} 
import type { User } from "@/types/user";

export function isProfileComplete(profile: Partial<User> | null): boolean {
  if (!profile) return false;
  
  return Boolean(
    profile.location &&
    profile.dateOfBirth &&
    profile.gender &&
    profile.livingStatus &&
    // Add any other required fields here
    true // Ensure all conditions are met
  );
} 
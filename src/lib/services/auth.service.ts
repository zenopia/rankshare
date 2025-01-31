import { auth as getAuth } from "@clerk/nextjs/server";
import { useAuth as useClerkAuth, useUser, useClerk } from "@clerk/nextjs";
import type { User } from "@clerk/backend";
import { AuthUser } from "@/types/auth";
import { connectToMongoDB } from "@/lib/db/client";
import { getUserModel } from "@/lib/db/models-v2/user";

export class AuthService {
  static async getCurrentUser(): Promise<AuthUser | null> {
    const { userId } = getAuth();
    if (!userId) return null;

    try {
      await connectToMongoDB();
      const UserModel = await getUserModel();
      const user = await UserModel.findOne({ clerkId: userId }).lean();
      
      if (!user) return null;
      
      return {
        id: user.clerkId,
        email: user.email || null,
        username: user.username,
        firstName: null, // We don't store these separately
        lastName: null,  // We don't store these separately
        fullName: user.displayName,
        imageUrl: user.imageUrl,
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static async getUserByUsername(username: string): Promise<AuthUser | null> {
    try {
      await connectToMongoDB();
      const UserModel = await getUserModel();
      const user = await UserModel.findOne({ username }).lean();
      
      if (!user) return null;
      
      return {
        id: user.clerkId,
        email: user.email || null,
        username: user.username,
        firstName: null, // We don't store these separately
        lastName: null,  // We don't store these separately
        fullName: user.displayName,
        imageUrl: user.imageUrl,
      };
    } catch (error) {
      console.error("Error getting user by username:", error);
      return null;
    }
  }

  static transformClerkUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.emailAddresses?.[0]?.emailAddress || null,
      username: user.username || null,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || null,
      imageUrl: user.imageUrl || null,
    };
  }
}

// Client-side hooks
export function useAuthService() {
  const { isLoaded, isSignedIn: clerkIsSignedIn, signOut: clerkSignOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const clerk = useClerk();

  const user = clerkUser ? AuthService.transformClerkUser(clerkUser as unknown as User) : null;
  const isSignedIn = clerkIsSignedIn ?? false;

  const getToken = async () => {
    try {
      if (!clerk.session) {
        console.warn("No clerk session found");
        return null;
      }

      // Add retry logic for mobile browsers with production-specific handling
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // First try to get the token directly
          const token = await clerk.session.getToken();
          if (token) {
            // Validate token format
            if (typeof token !== 'string' || token.trim() === '') {
              throw new Error('Invalid token format');
            }
            return token;
          }

          // If no token, try to refresh the session in production
          if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('.prod.')) {
            console.debug('Attempting session refresh in production');
            try {
              // Force a session touch
              await clerk.session.touch();
              // Small delay to allow session update
              await new Promise(resolve => setTimeout(resolve, 100));
              const refreshedToken = await clerk.session.getToken();
              if (refreshedToken) {
                return refreshedToken;
              }
            } catch (refreshError) {
              console.warn('Session refresh failed:', refreshError);
              // On mobile, try to get a new session
              if (/Mobile|Android|iPhone/i.test(window.navigator.userAgent)) {
                try {
                  await clerk.session.remove();
                  await clerk.openSignIn();
                  const newToken = await clerk.session?.getToken();
                  if (newToken) {
                    return newToken;
                  }
                } catch (e) {
                  console.warn('New session creation failed:', e);
                }
              }
            }
          }

          retryCount++;
          // Exponential backoff for retries
          await new Promise(resolve => setTimeout(resolve, Math.min(100 * Math.pow(2, retryCount), 1000)));
        } catch (error) {
          console.warn(`Token fetch attempt ${retryCount + 1} failed:`, error);
          
          // Special handling for production token errors
          if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('.prod.')) {
            if (error instanceof Error && 
               (error.message?.includes('token') || error.message?.includes('session'))) {
              console.warn('Production token error, attempting session refresh');
              try {
                await clerk.session.touch();
                // On mobile, be more aggressive with session refresh
                if (/Mobile|Android|iPhone/i.test(window.navigator.userAgent)) {
                  await clerk.session.remove();
                  await clerk.openSignIn();
                }
              } catch (refreshError) {
                console.warn('Session refresh failed:', refreshError);
              }
            }
          }

          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          // Exponential backoff for retries
          await new Promise(resolve => setTimeout(resolve, Math.min(100 * Math.pow(2, retryCount), 1000)));
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error getting token:", error);
      
      // Special handling for production errors
      if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('.prod.')) {
        // Check if this is a session-related error
        if (error instanceof Error && 
            (error.message?.includes('session') || error.message?.includes('token'))) {
          console.warn('Production session error, signing out and redirecting');
          try {
            // Force a complete session cleanup
            await clerk.session?.remove();
            await clerk.signOut();
          } catch (e) {
            console.error("Error signing out:", e);
          }
        }
      }
      return null;
    }
  };

  const handleSignIn = async (returnUrl?: string) => {
    try {
      // In production, ensure we clear any existing session data first
      if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('.prod.')) {
        try {
          await clerk.signOut();
        } catch (e) {
          // Ignore signOut errors
        }
      }

      await clerk.openSignIn({
        redirectUrl: returnUrl || "/",
        // Ensure we always get a fresh session in production
        appearance: {
          variables: {
            // Force dark mode in sign-in modal for consistency
            colorPrimary: '#0F172A',
          }
        }
      });
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const handleSignUp = async (returnUrl?: string) => {
    try {
      // In production, ensure we clear any existing session data first
      if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('.prod.')) {
        try {
          await clerk.signOut();
        } catch (e) {
          // Ignore signOut errors
        }
      }

      await clerk.openSignUp({
        redirectUrl: returnUrl || "/",
        // Ensure we always get a fresh session in production
        appearance: {
          variables: {
            // Force dark mode in sign-up modal for consistency
            colorPrimary: '#0F172A',
          }
        }
      });
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('.prod.')) {
        // In production, ensure we clear the specific session
        await clerk.signOut({ sessionId: clerk.session?.id });
      } else {
        await clerkSignOut();
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Force a reload in production to ensure clean state
      if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('.prod.')) {
        window.location.href = '/';
      }
    }
  };

  return {
    isLoaded,
    isSignedIn,
    user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    getToken,
  };
} 

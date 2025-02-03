import { AuthUser } from '@/types/auth';

/**
 * Configuration options for the auth provider
 */
export interface AuthProviderConfig {
  publicRoutes: string[];
  protectedRoutes?: string[];
  apiConfig?: {
    publicPaths: string[];
    protectedPaths: string[];
  };
}

/**
 * Result of an authentication check
 */
export interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
  sessionId?: string;
  error?: string;
}

/**
 * Core interface that all auth providers must implement
 */
export interface IAuthProvider {
  /**
   * Get the currently authenticated user
   */
  getCurrentUser(): Promise<AuthUser | null>;

  /**
   * Get the current authentication token
   */
  getToken(): Promise<string | null>;

  /**
   * Sign in a user
   */
  signIn(returnUrl?: string): Promise<void>;

  /**
   * Sign up a new user
   */
  signUp(returnUrl?: string): Promise<void>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<void>;

  /**
   * Validate the current session
   */
  validateSession(): Promise<AuthResult>;

  /**
   * Initialize the auth provider with configuration
   */
  initialize(config: AuthProviderConfig): Promise<void>;

  /**
   * Get the current session state
   */
  getSessionState(): Promise<{
    isLoaded: boolean;
    isSignedIn: boolean;
    user: AuthUser | null;
  }>;

  /**
   * Handle authentication for API routes
   */
  handleApiAuth(request: Request): Promise<AuthResult>;

  /**
   * Check if a route requires authentication
   */
  requiresAuth(path: string): boolean;
}

/**
 * Hook interface for client-side auth functionality
 */
export interface IAuthHooks {
  useAuth(): {
    isLoaded: boolean;
    isSignedIn: boolean;
    user: AuthUser | null;
    signIn: (returnUrl?: string) => Promise<void>;
    signUp: (returnUrl?: string) => Promise<void>;
    signOut: () => Promise<void>;
    getToken: () => Promise<string | null>;
  };
} 
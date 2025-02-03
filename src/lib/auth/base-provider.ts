import { AuthProviderConfig, AuthResult, IAuthProvider } from './types';
import { AuthUser } from '@/types/auth';

/**
 * Abstract base class providing common functionality for auth providers
 */
export abstract class BaseAuthProvider implements IAuthProvider {
  protected config: AuthProviderConfig | null = null;

  /**
   * Initialize the provider with configuration
   */
  async initialize(config: AuthProviderConfig): Promise<void> {
    this.config = config;
  }

  /**
   * Check if a route requires authentication
   */
  requiresAuth(path: string): boolean {
    return this.isProtectedRoute(path);
  }

  /**
   * Check if a route is public
   */
  protected isPublicRoute(path: string): boolean {
    if (!this.config) return false;
    
    return this.config.publicRoutes.some(route => {
      // Convert route pattern to regex
      const pattern = route
        .replace(/\*/g, '.*')
        .replace(/:\w+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });
  }

  /**
   * Check if a route is protected
   */
  protected isProtectedRoute(path: string): boolean {
    if (!this.config?.protectedRoutes) return !this.isPublicRoute(path);
    
    return this.config.protectedRoutes.some(route => {
      const pattern = route
        .replace(/\*/g, '.*')
        .replace(/:\w+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });
  }

  /**
   * Check if an API path is public
   */
  protected isPublicApiPath(path: string): boolean {
    if (!this.config?.apiConfig) return false;
    
    return this.config.apiConfig.publicPaths.some(route => {
      const pattern = route
        .replace(/\*/g, '.*')
        .replace(/:\w+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    });
  }

  // Abstract methods that must be implemented by specific providers
  abstract getCurrentUser(): Promise<AuthUser | null>;
  abstract getToken(): Promise<string | null>;
  abstract signIn(returnUrl?: string): Promise<void>;
  abstract signUp(returnUrl?: string): Promise<void>;
  abstract signOut(): Promise<void>;
  abstract validateSession(): Promise<AuthResult>;
  abstract getSessionState(): Promise<{
    isLoaded: boolean;
    isSignedIn: boolean;
    user: AuthUser | null;
  }>;
  abstract handleApiAuth(request: Request): Promise<AuthResult>;
} 
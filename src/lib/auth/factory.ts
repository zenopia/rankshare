import { IAuthProvider, AuthProviderConfig } from './types';

export type SupportedAuthProvider = 'clerk' | 'custom';

/**
 * Factory class for creating and managing auth provider instances
 */
export class AuthFactory {
  private static instance: IAuthProvider | null = null;
  private static currentProvider: SupportedAuthProvider | null = null;

  /**
   * Get the configured auth provider instance
   */
  static async getProvider(
    providerType: SupportedAuthProvider = 'clerk',
    config?: AuthProviderConfig
  ): Promise<IAuthProvider> {
    // If we already have an instance and the provider type hasn't changed, return it
    if (this.instance && this.currentProvider === providerType) {
      return this.instance;
    }

    // Load the provider dynamically to avoid importing unused providers
    const provider = await this.loadProvider(providerType);
    
    // Initialize the provider with config if provided
    if (config) {
      await provider.initialize(config);
    }

    // Store the instance and provider type
    this.instance = provider;
    this.currentProvider = providerType;

    return provider;
  }

  /**
   * Load a provider implementation dynamically
   */
  private static async loadProvider(type: SupportedAuthProvider): Promise<IAuthProvider> {
    switch (type) {
      case 'clerk':
        // Dynamic import to avoid loading unused providers
        const { ClerkAuthProvider } = await import('./providers/clerk-provider');
        return new ClerkAuthProvider();
      
      case 'custom':
        throw new Error('Custom auth provider not implemented');
      
      default:
        throw new Error(`Unsupported auth provider type: ${type}`);
    }
  }

  /**
   * Clear the current provider instance
   * Useful for testing or when switching providers
   */
  static clearInstance(): void {
    this.instance = null;
    this.currentProvider = null;
  }
} 
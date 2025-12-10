/**
 * AuthClient - Core authentication client
 * 
 * This is the main entry point for the auth system.
 * It manages the auth provider and observable state.
 */

import type {
  AuthProvider,
  AuthContext,
  
  User,
  Session,
  AuthError,
  SignInRequest,
  SignUpRequest,
  UpdateUserRequest,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  OAuthSignInRequest,
  OAuthCallbackRequest,
  MagicLinkRequest,
  MagicLinkVerifyRequest,
  PhoneAuthRequest,
  PhoneVerifyRequest,
  TwoFactorSetupRequest,
  TwoFactorVerifyRequest,
  PasskeyRegisterRequest,
  PasskeyAuthRequest,
  OAuthProvider,
  TwoFactorMethod,
  PasskeyCredential,
  Organization,
  OrganizationMembership,
} from './types';
import { Observable } from './types';
import { AuthState, AuthErrorType } from './types';

/**
 * Auth client configuration
 */
export interface AuthClientConfig {
  provider: AuthProvider;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

/**
 * Auth client class
 */
export class AuthClient {
  private provider: AuthProvider;
  private autoRefresh: boolean;
  private refreshInterval: number;
  private refreshTimer?: ReturnType<typeof setTimeout>;

  // Observable state
  public readonly state: Observable<AuthContext>;
  
  // Expose adapter for accessing provider-specific methods
  public get adapter(): AuthProvider {
    return this.provider;
  }

  constructor(config: AuthClientConfig) {
    this.provider = config.provider;
    this.autoRefresh = config.autoRefresh ?? true;
    this.refreshInterval = config.refreshInterval ?? 5 * 60 * 1000; // 5 minutes

    // Initialize observable state
    this.state = new Observable<AuthContext>({
      state: AuthState.LOADING,
      user: null,
      session: null,
      error: null,
      isAuthenticated: false,
      isLoading: true,
    });
  }

  /**
   * Initialize the auth client
   */
  async initialize(): Promise<void> {
    try {
      // Try to restore session
      const user = await this.provider.getCurrentUser();
      const session = await this.provider.getCurrentSession();

      if (user && session) {
        this.updateState({
          state: AuthState.AUTHENTICATED,
          user,
          session,
          error: null,
          isAuthenticated: true,
          isLoading: false,
        });

        // Start auto-refresh if enabled
        if (this.autoRefresh) {
          this.startAutoRefresh();
        }
      } else {
        this.updateState({
          state: AuthState.UNAUTHENTICATED,
          user: null,
          session: null,
          error: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Sign in with credentials
   */
  async signIn(request: SignInRequest): Promise<void> {
    try {
      this.setLoading();
      const response = await this.provider.signIn(request);

      if (response.requiresTwoFactor) {
        // Store user temporarily for 2FA verification
        this.updateState({
          state: AuthState.UNAUTHENTICATED,
          user: response.user,
          session: null,
          error: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      this.updateState({
        state: AuthState.AUTHENTICATED,
        user: response.user,
        session: response.session,
        error: null,
        isAuthenticated: true,
        isLoading: false,
      });

      if (this.autoRefresh) {
        this.startAutoRefresh();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Sign up with credentials
   */
  async signUp(request: SignUpRequest): Promise<void> {
    try {
      this.setLoading();
      const response = await this.provider.signUp(request);

      this.updateState({
        state: AuthState.AUTHENTICATED,
        user: response.user,
        session: response.session,
        error: null,
        isAuthenticated: true,
        isLoading: false,
      });

      if (this.autoRefresh) {
        this.startAutoRefresh();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      this.stopAutoRefresh();
      await this.provider.signOut();

      this.updateState({
        state: AuthState.UNAUTHENTICATED,
        user: null,
        session: null,
        error: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateUser(request: UpdateUserRequest): Promise<void> {
    try {
      const user = await this.provider.updateUser(request);
      const currentState = this.state.getValue();

      this.updateState({
        ...currentState,
        user,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Change password
   */
  async changePassword(request: PasswordChangeRequest): Promise<void> {
    try {
      await this.provider.changePassword(request);
    } catch (error) {
      throw this.provider.normalizeError(error);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    try {
      await this.provider.requestPasswordReset(request);
    } catch (error) {
      throw this.provider.normalizeError(error);
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(request: PasswordResetConfirmRequest): Promise<void> {
    try {
      await this.provider.confirmPasswordReset(request);
    } catch (error) {
      throw this.provider.normalizeError(error);
    }
  }

  /**
   * Get OAuth sign in URL
   */
  async getOAuthUrl(request: OAuthSignInRequest): Promise<string> {
    return this.provider.oauthSignIn(request);
  }

  /**
   * Handle OAuth callback
   */
  async handleOAuthCallback(request: OAuthCallbackRequest): Promise<void> {
    try {
      this.setLoading();
      const response = await this.provider.oauthCallback(request);

      this.updateState({
        state: AuthState.AUTHENTICATED,
        user: response.user,
        session: response.session,
        error: null,
        isAuthenticated: true,
        isLoading: false,
      });

      if (this.autoRefresh) {
        this.startAutoRefresh();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get available OAuth providers
   */
  async getOAuthProviders(): Promise<OAuthProvider[]> {
    return this.provider.getOAuthProviders();
  }

  /**
   * Send magic link
   */
  async sendMagicLink(request: MagicLinkRequest): Promise<void> {
    try {
      await this.provider.sendMagicLink(request);
    } catch (error) {
      throw this.provider.normalizeError(error);
    }
  }

  /**
   * Verify magic link
   */
  async verifyMagicLink(request: MagicLinkVerifyRequest): Promise<void> {
    try {
      this.setLoading();
      const response = await this.provider.verifyMagicLink(request);

      this.updateState({
        state: AuthState.AUTHENTICATED,
        user: response.user,
        session: response.session,
        error: null,
        isAuthenticated: true,
        isLoading: false,
      });

      if (this.autoRefresh) {
        this.startAutoRefresh();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Send phone verification code
   */
  async sendPhoneCode(request: PhoneAuthRequest): Promise<void> {
    try {
      await this.provider.sendPhoneCode(request);
    } catch (error) {
      throw this.provider.normalizeError(error);
    }
  }

  /**
   * Verify phone code
   */
  async verifyPhoneCode(request: PhoneVerifyRequest): Promise<void> {
    try {
      this.setLoading();
      const response = await this.provider.verifyPhoneCode(request);

      this.updateState({
        state: AuthState.AUTHENTICATED,
        user: response.user,
        session: response.session,
        error: null,
        isAuthenticated: true,
        isLoading: false,
      });

      if (this.autoRefresh) {
        this.startAutoRefresh();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Setup 2FA
   */
  async setupTwoFactor(request: TwoFactorSetupRequest) {
    return this.provider.setupTwoFactor(request);
  }

  /**
   * Verify 2FA code
   */
  async verifyTwoFactor(request: TwoFactorVerifyRequest): Promise<void> {
    try {
      this.setLoading();
      const response = await this.provider.verifyTwoFactor(request);

      this.updateState({
        state: AuthState.AUTHENTICATED,
        user: response.user,
        session: response.session,
        error: null,
        isAuthenticated: true,
        isLoading: false,
      });

      if (this.autoRefresh) {
        this.startAutoRefresh();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Disable 2FA
   */
  async disableTwoFactor(): Promise<void> {
    return this.provider.disableTwoFactor();
  }

  /**
   * Get 2FA status
   */
  async getTwoFactorStatus(): Promise<TwoFactorMethod[]> {
    return this.provider.getTwoFactorStatus();
  }

  /**
   * Register passkey
   */
  async registerPasskey(request: PasskeyRegisterRequest): Promise<PasskeyCredential> {
    return this.provider.registerPasskey(request);
  }

  /**
   * Authenticate with passkey
   */
  async authenticatePasskey(request: PasskeyAuthRequest): Promise<void> {
    try {
      this.setLoading();
      const response = await this.provider.authenticatePasskey(request);

      this.updateState({
        state: AuthState.AUTHENTICATED,
        user: response.user,
        session: response.session,
        error: null,
        isAuthenticated: true,
        isLoading: false,
      });

      if (this.autoRefresh) {
        this.startAutoRefresh();
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * List passkeys
   */
  async listPasskeys(): Promise<PasskeyCredential[]> {
    return this.provider.listPasskeys();
  }

  /**
   * Delete passkey
   */
  async deletePasskey(credentialId: string): Promise<void> {
    return this.provider.deletePasskey(credentialId);
  }

  /**
   * Get all organizations the user belongs to
   * Only available if the provider supports organizations
   */
  async getOrganizations(): Promise<Organization[]> {
    if (!this.provider.getOrganizations) {
      throw this.createUnsupportedError('Organization support');
    }
    return this.provider.getOrganizations();
  }

  /**
   * Get the currently active organization
   * Only available if the provider supports organizations
   */
  async getActiveOrganization(): Promise<Organization | null> {
    if (!this.provider.getActiveOrganization) {
      throw this.createUnsupportedError('Organization support');
    }
    return this.provider.getActiveOrganization();
  }

  /**
   * Set the active organization and refresh user state
   * Only available if the provider supports organizations
   */
  async setActiveOrganization(organizationId: string): Promise<void> {
    if (!this.provider.setActiveOrganization) {
      throw this.createUnsupportedError('Organization support');
    }
    
    await this.provider.setActiveOrganization(organizationId);
    
    // Refresh session to get updated user with new org context
    await this.refreshSession();
  }

  /**
   * Get organization memberships with roles and permissions
   * Only available if the provider supports organizations
   */
  async getOrganizationMemberships(): Promise<OrganizationMembership[]> {
    if (!this.provider.getOrganizationMemberships) {
      throw this.createUnsupportedError('Organization memberships');
    }
    return this.provider.getOrganizationMemberships();
  }

  /**
   * Check if the provider supports organizations
   */
  supportsOrganizations(): boolean {
    return !!(
      this.provider.getOrganizations &&
      this.provider.getActiveOrganization &&
      this.provider.setActiveOrganization
    );
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<void> {
    try {
      const session = await this.provider.refreshSession();
      const currentState = this.state.getValue();

      this.updateState({
        ...currentState,
        session,
      });
    } catch (error) {
      // Session refresh failed - log error but DON'T sign out
      // In cookie-based auth, the backend manages the session
      // A failed refresh might be temporary (network error, etc.)
      console.warn('[AuthClient] Session refresh failed:', error);
      // Backend session cookie may still be valid - don't destroy it
    }
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.state.getValue().user;
  }

  /**
   * Get current session
   */
  getSession(): Session | null {
    return this.state.getValue().session;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.state.getValue().isAuthenticated;
  }

  /**
   * Get current error
   */
  getError(): AuthError | null {
    return this.state.getValue().error;
  }

  /**
   * Clear error
   */
  clearError(): void {
    const currentState = this.state.getValue();
    this.updateState({
      ...currentState,
      error: null,
    });
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (context: AuthContext) => void) {
    return this.state.subscribe(listener);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopAutoRefresh();
    this.state.clearListeners();
  }

  // Private methods

  private updateState(newState: AuthContext): void {
    this.state.setValue(newState);
  }

  private setLoading(): void {
    const currentState = this.state.getValue();
    this.updateState({
      ...currentState,
      state: AuthState.LOADING,
      isLoading: true,
      error: null,
    });
  }

  private handleError(error: unknown): never {
    const authError = this.provider.normalizeError(error);
    const currentState = this.state.getValue();

    this.updateState({
      ...currentState,
      state: AuthState.ERROR,
      error: authError,
      isLoading: false,
    });

    // Re-throw the error so callers can handle it
    throw authError;
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshTimer = setInterval(() => {
      this.refreshSession();
    }, this.refreshInterval);
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = undefined;
    }
  }

  private createUnsupportedError(feature: string): AuthError {
    return {
      name: 'AuthError',
      message: `${feature} is not available with this auth provider`,
      type: AuthErrorType.UNKNOWN_ERROR,
    } as AuthError;
  }
}


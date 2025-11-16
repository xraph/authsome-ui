/**
 * Base auth provider implementation
 */

import type {
  AuthProvider,
  AuthResponse,
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
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  PasskeyRegisterRequest,
  PasskeyAuthRequest,
  User,
  Session,
  OAuthProvider,
  TwoFactorMethod,
  PasskeyCredential,
  AuthError,
  ProviderConfig,
} from '../types';
import { toAuthError } from '../utils';

/**
 * Base provider class with common functionality
 */
export abstract class BaseAuthProvider implements AuthProvider {
  abstract readonly name: string;
  protected config: ProviderConfig = {};
  protected initialized = false;

  /**
   * Initialize the provider
   */
  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config;
    this.initialized = true;
  }

  /**
   * Ensure provider is initialized
   */
  protected ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(`Provider ${this.name} is not initialized`);
    }
  }

  /**
   * Make HTTP request
   */
  protected async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw error;
    }

    return response.json();
  }

  // Abstract methods that must be implemented by subclasses
  abstract signIn(request: SignInRequest): Promise<AuthResponse>;
  abstract signUp(request: SignUpRequest): Promise<AuthResponse>;
  abstract signOut(): Promise<void>;
  abstract getCurrentUser(): Promise<User | null>;
  abstract getCurrentSession(): Promise<Session | null>;
  abstract refreshSession(): Promise<Session>;
  abstract updateUser(request: UpdateUserRequest): Promise<User>;
  abstract changePassword(request: PasswordChangeRequest): Promise<void>;
  abstract requestPasswordReset(request: PasswordResetRequest): Promise<void>;
  abstract confirmPasswordReset(request: PasswordResetConfirmRequest): Promise<void>;
  abstract oauthSignIn(request: OAuthSignInRequest): Promise<string>;
  abstract oauthCallback(request: OAuthCallbackRequest): Promise<AuthResponse>;
  abstract getOAuthProviders(): Promise<OAuthProvider[]>;
  abstract sendMagicLink(request: MagicLinkRequest): Promise<void>;
  abstract verifyMagicLink(request: MagicLinkVerifyRequest): Promise<AuthResponse>;
  abstract sendPhoneCode(request: PhoneAuthRequest): Promise<void>;
  abstract verifyPhoneCode(request: PhoneVerifyRequest): Promise<AuthResponse>;
  abstract setupTwoFactor(request: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse>;
  abstract verifyTwoFactor(request: TwoFactorVerifyRequest): Promise<AuthResponse>;
  abstract disableTwoFactor(): Promise<void>;
  abstract getTwoFactorStatus(): Promise<TwoFactorMethod[]>;
  abstract registerPasskey(request: PasskeyRegisterRequest): Promise<PasskeyCredential>;
  abstract authenticatePasskey(request: PasskeyAuthRequest): Promise<AuthResponse>;
  abstract listPasskeys(): Promise<PasskeyCredential[]>;
  abstract deletePasskey(credentialId: string): Promise<void>;

  /**
   * Normalize error to AuthError
   */
  normalizeError(error: unknown): AuthError {
    return toAuthError(error);
  }
}


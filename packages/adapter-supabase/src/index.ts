/**
 * Supabase adapter for AuthSome UI
 * Uses the official Supabase JS client
 */

import { createClient, SupabaseClient, AuthError as SupabaseAuthError } from '@supabase/supabase-js';
import type {
  AuthProvider,
  User,
  Session,
  AuthResponse,
  OAuthProvider,
} from '@authsome/ui-core';
import { AuthError } from '@authsome/ui-core';

export interface SupabaseAdapterConfig {
  url: string;
  anonKey: string;
  options?: {
    auth?: {
      autoRefreshToken?: boolean;
      persistSession?: boolean;
      detectSessionInUrl?: boolean;
    };
  };
}

export class SupabaseAdapter implements AuthProvider {
  private client: SupabaseClient;
  private config: SupabaseAdapterConfig;

  constructor(config: SupabaseAdapterConfig) {
    this.config = config;
    this.client = createClient(config.url, config.anonKey, config.options);
  }

  async initialize(): Promise<void> {
    // Supabase client initializes automatically
    // Check if we have an existing session
    const { data } = await this.client.auth.getSession();
    if (data.session) {
      // Session exists and is valid
      console.log('Existing Supabase session found');
    }
  }

  destroy(): void {
    // Supabase handles cleanup internally
  }

  // Helper to transform Supabase user to our User type
  private transformUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.user_metadata?.username,
      emailVerified: !!supabaseUser.email_confirmed_at,
      phoneNumber: supabaseUser.phone,
      phoneVerified: !!supabaseUser.phone_confirmed_at,
      metadata: supabaseUser.user_metadata,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
    };
  }

  // Helper to transform Supabase session to our Session type
  private transformSession(supabaseSession: any): Session {
    return {
      user: this.transformUser(supabaseSession.user),
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token,
      expiresAt: new Date(supabaseSession.expires_at * 1000).toISOString(),
    };
  }

  // Helper to handle Supabase errors
  private handleError(error: SupabaseAuthError | Error): never {
    if ('status' in error && error.status) {
      throw new AuthError(
        error.message,
        this.getErrorCode(error.message),
        error.status
      );
    }
    throw new AuthError(error.message, 'UNKNOWN_ERROR');
  }

  private getErrorCode(message: string): string {
    if (message.includes('Invalid login credentials')) return 'INVALID_CREDENTIALS';
    if (message.includes('Email not confirmed')) return 'EMAIL_NOT_VERIFIED';
    if (message.includes('User already registered')) return 'EMAIL_ALREADY_EXISTS';
    if (message.includes('Password')) return 'INVALID_PASSWORD';
    return 'AUTH_ERROR';
  }

  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email: credentials.email || '',
        password: credentials.password,
      });

      if (error) this.handleError(error);
      if (!data.user || !data.session) {
        throw new AuthError('Sign in failed', 'SIGN_IN_FAILED');
      }

      return {
        user: this.transformUser(data.user),
        session: this.transformSession(data.session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: signUpData, error } = await this.client.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username,
            ...data.metadata,
          },
        },
      });

      if (error) this.handleError(error);
      if (!signUpData.user) {
        throw new AuthError('Sign up failed', 'SIGN_UP_FAILED');
      }

      return {
        user: this.transformUser(signUpData.user),
        session: signUpData.session ? this.transformSession(signUpData.session) : undefined,
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) this.handleError(error);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await this.client.auth.getUser();
      if (error) this.handleError(error);
      return data.user ? this.transformUser(data.user) : null;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.client.auth.getSession();
      if (error) this.handleError(error);
      return data.session ? this.transformSession(data.session) : null;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.client.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) this.handleError(error);
      if (!data.session || !data.user) {
        throw new AuthError('Session refresh failed', 'REFRESH_FAILED');
      }

      return {
        user: this.transformUser(data.user),
        session: this.transformSession(data.session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async initializeOAuth(provider: OAuthProvider, options?: { redirectUri?: string }): Promise<OAuthInitResponse> {
    try {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: options?.redirectUri,
        },
      });

      if (error) this.handleError(error);

      return {
        url: data.url || '',
        state: '', // Supabase handles state internally
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async handleOAuthCallback(_params: OAuthCallbackParams): Promise<AuthResponse> {
    try {
      // Supabase handles OAuth callback automatically via session detection
      const { data, error } = await this.client.auth.getSession();

      if (error) this.handleError(error);
      if (!data.session) {
        throw new AuthError('OAuth callback failed', 'OAUTH_CALLBACK_FAILED');
      }

      return {
        user: this.transformUser(data.session.user),
        session: this.transformSession(data.session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async sendMagicLink(email: string, options?: MagicLinkOptions): Promise<void> {
    try {
      const { error } = await this.client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: options?.redirectUri,
        },
      });

      if (error) this.handleError(error);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async verifyMagicLink(token: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.client.auth.verifyOtp({
        token_hash: token,
        type: 'magiclink',
      });

      if (error) this.handleError(error);
      if (!data.user || !data.session) {
        throw new AuthError('Magic link verification failed', 'MAGIC_LINK_INVALID');
      }

      return {
        user: this.transformUser(data.user),
        session: this.transformSession(data.session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async setup2FA(method: TwoFactorMethod): Promise<TwoFactorSetupResponse> {
    try {
      const { data, error } = await this.client.auth.mfa.enroll({
        factorType: method === 'totp' ? 'totp' : 'phone',
      });

      if (error) this.handleError(error);

      return {
        secret: data.totp?.secret || '',
        qrCode: data.totp?.qr_code || '',
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async verify2FA(code: string, _method?: string): Promise<AuthResponse> {
    try {
      // Get the enrolled factor
      const { data: { factors } } = await this.client.auth.mfa.listFactors();
      const factor = factors?.[0];

      if (!factor) {
        throw new AuthError('No 2FA factor found', '2FA_NOT_SETUP');
      }

      const { data, error } = await this.client.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code,
      });

      if (error) this.handleError(error);
      if (!data.session) {
        throw new AuthError('2FA verification failed', '2FA_INVALID');
      }

      return {
        user: this.transformUser(data.session.user),
        session: this.transformSession(data.session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async disable2FA(_code: string): Promise<void> {
    try {
      const { data: { factors } } = await this.client.auth.mfa.listFactors();
      const factor = factors?.[0];

      if (!factor) {
        throw new AuthError('No 2FA factor found', '2FA_NOT_SETUP');
      }

      const { error } = await this.client.auth.mfa.unenroll({
        factorId: factor.id,
      });

      if (error) this.handleError(error);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  // Supabase doesn't have native passkey support yet
  async registerPasskey(): Promise<any> {
    throw new AuthError('Passkeys not supported by Supabase', 'FEATURE_NOT_SUPPORTED');
  }

  async authenticateWithPasskey(): Promise<AuthResponse> {
    throw new AuthError('Passkeys not supported by Supabase', 'FEATURE_NOT_SUPPORTED');
  }

  async listPasskeys(): Promise<any[]> {
    throw new AuthError('Passkeys not supported by Supabase', 'FEATURE_NOT_SUPPORTED');
  }

  async deletePasskey(): Promise<void> {
    throw new AuthError('Passkeys not supported by Supabase', 'FEATURE_NOT_SUPPORTED');
  }

  // Phone auth
  async sendPhoneVerification(phoneNumber: string): Promise<void> {
    try {
      const { error } = await this.client.auth.signInWithOtp({
        phone: phoneNumber,
      });

      if (error) this.handleError(error);
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  async verifyPhone(code: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.client.auth.verifyOtp({
        type: 'sms',
        token: code,
      });

      if (error) this.handleError(error);
      if (!data.user || !data.session) {
        throw new AuthError('Phone verification failed', 'PHONE_VERIFICATION_FAILED');
      }

      return {
        user: this.transformUser(data.user),
        session: this.transformSession(data.session),
      };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      this.handleError(error as Error);
    }
  }

  // Username auth not natively supported, would need custom implementation
  async signInWithUsername(): Promise<AuthResponse> {
    throw new AuthError('Username auth not natively supported by Supabase', 'FEATURE_NOT_SUPPORTED');
  }

  async signUpWithUsername(): Promise<AuthResponse> {
    throw new AuthError('Username auth not natively supported by Supabase', 'FEATURE_NOT_SUPPORTED');
  }
}

export default SupabaseAdapter;


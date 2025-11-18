/**
 * Generic provider adapter for custom backends
 * 
 * This adapter allows users to connect to any custom authentication backend
 * by providing URL endpoints and transformation functions.
 */

import { AuthError, AuthErrorType } from '@authsome/ui-core';
import type {
  AuthProvider,
  User,
  Session,
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
  PasskeyCredential,
  OAuthProvider,
  TwoFactorMethod,
  ProviderConfig,
  FieldDefinition,
} from '@authsome/ui-core';

/**
 * Generic adapter configuration
 */
export interface GenericAdapterConfig extends ProviderConfig {
  // Base API URL
  apiUrl: string;

  // Optional custom headers for all requests
  headers?: Record<string, string>;

  // Endpoints configuration (relative to apiUrl)
  endpoints?: {
    signIn?: string;
    signUp?: string;
    signOut?: string;
    refreshSession?: string;
    getUser?: string;
    updateUser?: string;
    changePassword?: string;
    resetPassword?: string;
    resetPasswordConfirm?: string;
    oauthSignIn?: string;
    oauthCallback?: string;
    oauthProviders?: string;
    magicLink?: string;
    magicLinkVerify?: string;
    phoneAuth?: string;
    phoneVerify?: string;
    twoFactorSetup?: string;
    twoFactorVerify?: string;
    twoFactorDisable?: string;
    twoFactorStatus?: string;
    passkeyRegister?: string;
    passkeyAuth?: string;
    passkeyList?: string;
    passkeyDelete?: string;
  };

  // Optional response transformers
  transformers?: {
    user?: (data: unknown) => User;
    session?: (data: unknown) => Session;
    authResponse?: (data: unknown) => AuthResponse;
  };

  // Token configuration
  tokenConfig?: {
    accessTokenKey?: string;
    refreshTokenKey?: string;
    expiresAtKey?: string;
  };
}

/**
 * Generic adapter for custom backends
 */
export class GenericAdapter implements AuthProvider {
  readonly name = 'generic';
  
  private config: GenericAdapterConfig | null = null;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private initialized = false;

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config as GenericAdapterConfig;
    
    if (!this.config.apiUrl) {
      throw new Error('Generic adapter requires apiUrl in config');
    }
    
    // Set default endpoints
    this.config = {
      ...this.config,
      endpoints: {
        signIn: '/auth/signin',
        signUp: '/auth/signup',
        signOut: '/auth/signout',
        refreshSession: '/auth/refresh',
        getUser: '/auth/user',
        updateUser: '/auth/user',
        changePassword: '/auth/password/change',
        resetPassword: '/auth/password/reset',
        resetPasswordConfirm: '/auth/password/reset/confirm',
        oauthSignIn: '/auth/oauth',
        oauthCallback: '/auth/oauth/callback',
        oauthProviders: '/auth/oauth/providers',
        magicLink: '/auth/magic-link',
        magicLinkVerify: '/auth/magic-link/verify',
        phoneAuth: '/auth/phone',
        phoneVerify: '/auth/phone/verify',
        twoFactorSetup: '/auth/2fa/setup',
        twoFactorVerify: '/auth/2fa/verify',
        twoFactorDisable: '/auth/2fa/disable',
        twoFactorStatus: '/auth/2fa/status',
        passkeyRegister: '/auth/passkey/register',
        passkeyAuth: '/auth/passkey/auth',
        passkeyList: '/auth/passkey/list',
        passkeyDelete: '/auth/passkey/delete',
        ...this.config.endpoints,
      },
      transformers: this.config.transformers || {},
      tokenConfig: {
        accessTokenKey: 'accessToken',
        refreshTokenKey: 'refreshToken',
        expiresAtKey: 'expiresAt',
        ...this.config.tokenConfig,
      },
    };
    
    this.initialized = true;
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.config) {
      throw new Error('Generic adapter not initialized. Call initialize() first.');
    }
  }

  /**
   * Make HTTP request to API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    this.ensureInitialized();
    
    const url = `${this.config!.apiUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.config!.headers,
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw this.normalizeError(error);
      }

      return response.json();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async signIn(request: SignInRequest): Promise<AuthResponse> {
    const data = await this.request<unknown>(
      this.config!.endpoints!.signIn!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return this.processAuthResponse(data);
  }

  async signUp(request: SignUpRequest): Promise<AuthResponse> {
    const data = await this.request<unknown>(
      this.config!.endpoints!.signUp!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return this.processAuthResponse(data);
  }

  async signOut(): Promise<void> {
    try {
      await this.request(this.config!.endpoints!.signOut!, {
        method: 'POST',
      });
    } finally {
      this.accessToken = null;
      this.refreshToken = null;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken) {
      return null;
    }

    try {
      const data = await this.request<unknown>(this.config!.endpoints!.getUser!);
      return this.config!.transformers!.user?.(data) || (data as User);
    } catch {
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    if (!this.accessToken) {
      return null;
    }

    const user = await this.getCurrentUser();
    if (!user) {
      return null;
    }

    return {
      id: this.accessToken.substring(0, 16), // Use token prefix as session ID
      userId: user.id,
      token: this.accessToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
  }

  async refreshSession(): Promise<Session> {
    if (!this.refreshToken) {
      throw new AuthError('No refresh token available', AuthErrorType.TOKEN_EXPIRED);
    }

    const data = await this.request<unknown>(
      this.config!.endpoints!.refreshSession!,
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      }
    );

    const authResponse = this.processAuthResponse(data);
    if (!authResponse.session) {
      throw new AuthError('Failed to refresh session', AuthErrorType.TOKEN_EXPIRED);
    }

    return authResponse.session;
  }

  async updateUser(request: UpdateUserRequest): Promise<User> {
    const data = await this.request<unknown>(
      this.config!.endpoints!.updateUser!,
      {
        method: 'PATCH',
        body: JSON.stringify(request),
      }
    );

    return this.config!.transformers!.user?.(data) || (data as User);
  }

  async changePassword(request: PasswordChangeRequest): Promise<void> {
    await this.request(
      this.config!.endpoints!.changePassword!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    await this.request(
      this.config!.endpoints!.resetPassword!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async confirmPasswordReset(request: PasswordResetConfirmRequest): Promise<void> {
    await this.request(
      this.config!.endpoints!.resetPasswordConfirm!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async oauthSignIn(request: OAuthSignInRequest): Promise<string> {
    const data = await this.request<{ url: string }>(
      this.config!.endpoints!.oauthSignIn!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    
    return data.url;
  }

  async oauthCallback(request: OAuthCallbackRequest): Promise<AuthResponse> {
    const data = await this.request<unknown>(
      this.config!.endpoints!.oauthCallback!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return this.processAuthResponse(data);
  }

  async getOAuthProviders(): Promise<OAuthProvider[]> {
    const data = await this.request<{ providers: OAuthProvider[] }>(
      this.config!.endpoints!.oauthProviders!
    );
    
    return data.providers;
  }

  async sendMagicLink(request: MagicLinkRequest): Promise<void> {
    await this.request(
      this.config!.endpoints!.magicLink!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async verifyMagicLink(request: MagicLinkVerifyRequest): Promise<AuthResponse> {
    const data = await this.request<unknown>(
      this.config!.endpoints!.magicLinkVerify!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return this.processAuthResponse(data);
  }

  async sendPhoneCode(request: PhoneAuthRequest): Promise<void> {
    await this.request(
      this.config!.endpoints!.phoneAuth!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async verifyPhoneCode(request: PhoneVerifyRequest): Promise<AuthResponse> {
    const data = await this.request<unknown>(
      this.config!.endpoints!.phoneVerify!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return this.processAuthResponse(data);
  }

  async setupTwoFactor(request: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse> {
    return await this.request<TwoFactorSetupResponse>(
      this.config!.endpoints!.twoFactorSetup!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async verifyTwoFactor(request: TwoFactorVerifyRequest): Promise<AuthResponse> {
    const data = await this.request<unknown>(
      this.config!.endpoints!.twoFactorVerify!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return this.processAuthResponse(data);
  }

  async disableTwoFactor(): Promise<void> {
    await this.request(
      this.config!.endpoints!.twoFactorDisable!,
      {
        method: 'POST',
      }
    );
  }

  async getTwoFactorStatus(): Promise<TwoFactorMethod[]> {
    const data = await this.request<{ methods: TwoFactorMethod[] }>(
      this.config!.endpoints!.twoFactorStatus!
    );
    
    return data.methods;
  }

  async registerPasskey(request: PasskeyRegisterRequest): Promise<PasskeyCredential> {
    return await this.request<PasskeyCredential>(
      this.config!.endpoints!.passkeyRegister!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async authenticatePasskey(request: PasskeyAuthRequest): Promise<AuthResponse> {
    const data = await this.request<unknown>(
      this.config!.endpoints!.passkeyAuth!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return this.processAuthResponse(data);
  }

  async listPasskeys(): Promise<PasskeyCredential[]> {
    const data = await this.request<{ passkeys: PasskeyCredential[] }>(
      this.config!.endpoints!.passkeyList!
    );
    
    return data.passkeys;
  }

  async deletePasskey(credentialId: string): Promise<void> {
    await this.request(
      `${this.config!.endpoints!.passkeyDelete!}/${credentialId}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Get dynamic signup fields (stub implementation)
   */
  async getSignupFields(): Promise<FieldDefinition[]> {
    return [];
  }

  /**
   * Process authentication response
   */
  private processAuthResponse(data: unknown): AuthResponse {
    const authResponse = this.config!.transformers!.authResponse?.(data) || (data as AuthResponse);

    // Store tokens
    const tokenConfig = this.config!.tokenConfig!;
    this.accessToken = (data as Record<string, unknown>)[tokenConfig.accessTokenKey!] as string || null;
    this.refreshToken = (data as Record<string, unknown>)[tokenConfig.refreshTokenKey!] as string || null;

    return authResponse;
  }

  /**
   * Normalize error to AuthError
   */
  normalizeError(error: unknown): AuthError {
    if (error instanceof AuthError) {
      return error;
    }
    
    const message = (error as Error).message || 'Unknown error';
    const type = (error as any).type || AuthErrorType.UNKNOWN_ERROR;
    
    return new AuthError(message, type, {
      originalError: error,
    });
  }
}

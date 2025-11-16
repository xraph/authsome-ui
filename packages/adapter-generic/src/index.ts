/**
 * Generic provider adapter for custom backends
 * 
 * This adapter allows users to connect to any custom authentication backend
 * by providing URL endpoints and transformation functions.
 */

import type {
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
  TwoFactorVerifyRequest,
  PasskeyRegisterRequest,
  PasskeyAuthRequest,
  OAuthProvider,
  TwoFactorMethod,
  PasskeyCredential,
} from '@authsome/ui-core';
import { AuthErrorType, BaseAuthProvider, TokenManager, createAuthError } from '@authsome/ui-core';

/**
 * Generic adapter configuration
 */
export interface GenericAdapterConfig {
  // Base API URL
  apiUrl: string;

  // Optional custom headers for all requests
  headers?: Record<string, string>;

  // Endpoints configuration (relative to apiUrl)
  endpoints?: {
    signIn?: string;
    signUp?: string;
    signOut?: string;
    refreshToken?: string;
    getUser?: string;
    updateUser?: string;
    changePassword?: string;
    resetPassword?: string;
    resetPasswordConfirm?: string;
    oauthSignIn?: string;
    oauthCallback?: string;
    magicLink?: string;
    magicLinkVerify?: string;
    phoneAuth?: string;
    phoneVerify?: string;
    twoFactorSetup?: string;
    twoFactorVerify?: string;
    passkeyRegister?: string;
    passkeyAuth?: string;
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
export class GenericAdapter extends BaseAuthProvider {
  private config: Required<GenericAdapterConfig>;
  private tokenManager: TokenManager;

  constructor(config: GenericAdapterConfig) {
    super();
    
    // Set default endpoints
    this.config = {
      ...config,
      headers: config.headers || {},
      endpoints: {
        signIn: '/auth/sign-in',
        signUp: '/auth/sign-up',
        signOut: '/auth/sign-out',
        refreshToken: '/auth/refresh',
        getUser: '/auth/user',
        updateUser: '/auth/user',
        changePassword: '/auth/password/change',
        resetPassword: '/auth/password/reset',
        resetPasswordConfirm: '/auth/password/reset/confirm',
        oauthSignIn: '/auth/oauth',
        oauthCallback: '/auth/oauth/callback',
        magicLink: '/auth/magic-link',
        magicLinkVerify: '/auth/magic-link/verify',
        phoneAuth: '/auth/phone',
        phoneVerify: '/auth/phone/verify',
        twoFactorSetup: '/auth/2fa/setup',
        twoFactorVerify: '/auth/2fa/verify',
        passkeyRegister: '/auth/passkey/register',
        passkeyAuth: '/auth/passkey/auth',
        ...config.endpoints,
      },
      transformers: config.transformers || {},
      tokenConfig: {
        accessTokenKey: 'accessToken',
        refreshTokenKey: 'refreshToken',
        expiresAtKey: 'expiresAt',
        ...config.tokenConfig,
      },
    } as Required<GenericAdapterConfig>;

    this.tokenManager = new TokenManager();
  }

  async initialize(): Promise<void> {
    // Check if we have stored tokens
    const tokens = this.tokenManager.getTokens();
    if (!tokens) {
      this.setState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    // Try to get current user
    try {
      const user = await this.getUser();
      this.setState({
        user,
        session: {
          user,
          expiresAt: tokens.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // Token might be invalid
      this.tokenManager.clearTokens();
      this.setState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }

  /**
   * Make HTTP request to API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`;
    const tokens = this.tokenManager.getTokens();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...options.headers,
    };

    if (tokens?.accessToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw createAuthError(
        error.message || 'Request failed',
        AuthErrorType.NETWORK_ERROR,
        error
      );
    }

    return response.json();
  }

  async signIn(request: SignInRequest): Promise<AuthResponse> {
    await this.ensureInitialized();

    const data = await this.request<unknown>(
      this.config.endpoints.signIn!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return this.processAuthResponse(data);
  }

  async signUp(request: SignUpRequest): Promise<AuthResponse> {
    await this.ensureInitialized();

    const data = await this.request<unknown>(
      this.config.endpoints.signUp!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return this.processAuthResponse(data);
  }

  async signOut(): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.request(this.config.endpoints.signOut!, {
        method: 'POST',
      });
    } finally {
      this.tokenManager.clearTokens();
      this.setState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    await this.ensureInitialized();

    const tokens = this.tokenManager.getTokens();
    if (!tokens?.refreshToken) {
      throw createAuthError('No refresh token available', AuthErrorType.UNAUTHORIZED);
    }

    const data = await this.request<unknown>(
      this.config.endpoints.refreshToken!,
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      }
    );

    return this.processAuthResponse(data);
  }

  async getUser(): Promise<User> {
    await this.ensureInitialized();

    const data = await this.request<unknown>(this.config.endpoints.getUser!);
    return this.config.transformers.user?.(data) || (data as User);
  }

  async updateUser(request: UpdateUserRequest): Promise<User> {
    await this.ensureInitialized();

    const data = await this.request<unknown>(
      this.config.endpoints.updateUser!,
      {
        method: 'PATCH',
        body: JSON.stringify(request),
      }
    );

    const user = this.config.transformers.user?.(data) || (data as User);
    this.setState({ user });
    return user;
  }

  async changePassword(request: PasswordChangeRequest): Promise<void> {
    await this.ensureInitialized();

    await this.request(
      this.config.endpoints.changePassword!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async resetPassword(request: PasswordResetRequest): Promise<void> {
    await this.ensureInitialized();

    await this.request(
      this.config.endpoints.resetPassword!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async resetPasswordConfirm(request: PasswordResetConfirmRequest): Promise<void> {
    await this.ensureInitialized();

    await this.request(
      this.config.endpoints.resetPasswordConfirm!,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async oauthSignIn(_request: OAuthSignInRequest): Promise<void> {
    await this.ensureInitialized();
    throw createAuthError('OAuth not implemented', AuthErrorType.NOT_SUPPORTED);
  }

  async oauthCallback(_request: OAuthCallbackRequest): Promise<AuthResponse> {
    await this.ensureInitialized();
    throw createAuthError('OAuth not implemented', AuthErrorType.NOT_SUPPORTED);
  }

  async magicLink(_request: MagicLinkRequest): Promise<void> {
    await this.ensureInitialized();
    throw createAuthError('Magic link not implemented', AuthErrorType.NOT_SUPPORTED);
  }

  async magicLinkVerify(_request: MagicLinkVerifyRequest): Promise<AuthResponse> {
    await this.ensureInitialized();
    throw createAuthError('Magic link not implemented', AuthErrorType.NOT_SUPPORTED);
  }

  async phoneAuth(_request: PhoneAuthRequest): Promise<void> {
    await this.ensureInitialized();
    throw createAuthError('Phone auth not implemented', AuthErrorType.NOT_SUPPORTED);
  }

  async phoneVerify(_request: PhoneVerifyRequest): Promise<AuthResponse> {
    await this.ensureInitialized();
    throw createAuthError('Phone auth not implemented', AuthErrorType.NOT_SUPPORTED);
  }

  async twoFactorSetup(_request: TwoFactorSetupRequest): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  }> {
    await this.ensureInitialized();
    throw createAuthError('2FA not implemented', AuthErrorType.NOT_SUPPORTED);
  }

  async twoFactorVerify(_request: TwoFactorVerifyRequest): Promise<AuthResponse> {
    await this.ensureInitialized();
    throw createAuthError('2FA not implemented', AuthErrorType.NOT_SUPPORTED);
  }

  async passkeyRegister(_request: PasskeyRegisterRequest): Promise<PasskeyCredential> {
    await this.ensureInitialized();
    throw createAuthError('Passkeys not implemented', AuthErrorType.NOT_SUPPORTED);
  }

  async passkeyAuth(_request: PasskeyAuthRequest): Promise<AuthResponse> {
    await this.ensureInitialized();
    throw createAuthError('Passkeys not implemented', AuthErrorType.NOT_SUPPORTED);
  }

  /**
   * Process authentication response
   */
  private processAuthResponse(data: unknown): AuthResponse {
    const authResponse = this.config.transformers.authResponse?.(data) || (data as AuthResponse);

    // Store tokens
    const tokenConfig = this.config.tokenConfig;
    const accessToken = (data as Record<string, unknown>)[tokenConfig.accessTokenKey!] as string;
    const refreshToken = (data as Record<string, unknown>)[tokenConfig.refreshTokenKey!] as string;
    const expiresAt = (data as Record<string, unknown>)[tokenConfig.expiresAtKey!] as string;

    if (accessToken) {
      this.tokenManager.setTokens({
        accessToken,
        refreshToken,
        expiresAt,
      });
    }

    // Update state
    if (authResponse.user) {
      this.setState({
        user: authResponse.user,
        session: authResponse.session,
        isAuthenticated: true,
        isLoading: false,
      });
    }

    return authResponse;
  }
}

/**
 * AuthSome adapter for AuthSome UI
 * 
 * This is a stub implementation that will be replaced with the official
 * AuthSome JS client when it is released.
 * 
 * For now, it provides a basic HTTP-based implementation.
 */

import { AuthError, AuthErrorType } from '@authsome/ui-core';
import type {
  AuthProvider,
  User,
  Session,
  SignInRequest,
  SignUpRequest,
  AuthResponse,
  OAuthProvider,
  OAuthSignInRequest,
  OAuthCallbackRequest,
  TwoFactorMethod,
  TwoFactorSetupRequest,
  TwoFactorVerifyRequest,
  TwoFactorSetupResponse,
  MagicLinkRequest,
  MagicLinkVerifyRequest,
  PhoneAuthRequest,
  PhoneVerifyRequest,
  PasskeyRegisterRequest,
  PasskeyAuthRequest,
  PasskeyCredential,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  UpdateUserRequest,
  ProviderConfig,
  FieldDefinition,
  SignupFieldsResponse,
} from '@authsome/ui-core';

export interface AuthSomeAdapterConfig extends ProviderConfig {
  /**
   * Base URL of your AuthSome API
   * @example "https://auth.yourapp.com/api"
   */
  apiUrl: string;
  
  /**
   * API key for authentication (optional)
   */
  apiKey?: string;

  /**
   * Request timeout in milliseconds (default: 30000)
   */
  timeout?: number;
}

/**
 * AuthSome adapter implementation
 * 
 * This is a stub that provides basic HTTP-based authentication.
 * Replace with official AuthSome JS client when available.
 */
export class AuthSomeAdapter implements AuthProvider {
  readonly name = 'authsome';
  
  private config: AuthSomeAdapterConfig | null = null;
  private accessToken: string | null = null;
  private initialized = false;
  private signupFields: FieldDefinition[] | null = null;

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config as AuthSomeAdapterConfig;
    
    if (!this.config.apiUrl) {
      throw new Error('AuthSome adapter requires apiUrl in config');
    }
    
    this.initialized = true;

    // Fetch signup fields configuration
    try {
      const response = await this.request<SignupFieldsResponse>('/auth/signup/fields');
      this.signupFields = response.fields;
    } catch (error) {
      // Fields are optional, continue if endpoint doesn't exist
      console.debug('Signup fields endpoint not available');
      this.signupFields = [];
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.config) {
      throw new Error('AuthSome adapter not initialized. Call initialize() first.');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    this.ensureInitialized();
    
    const url = `${this.config!.apiUrl}${endpoint}`;
    const timeout = this.config!.timeout || 30000;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };
      
      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }
      
      if (this.config!.apiKey) {
        headers['X-API-Key'] = this.config!.apiKey;
      }
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw this.normalizeError(error);
      }
      
      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.normalizeError(error);
    }
  }

  async signIn(request: SignInRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    if (response.session) {
      // Store access token if available (assuming session has it)
      this.accessToken = (response.session as any).accessToken;
    }
    
    return response;
  }

  async signUp(request: SignUpRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    if (response.session) {
      this.accessToken = (response.session as any).accessToken;
    }
    
    return response;
  }

  async signOut(): Promise<void> {
    await this.request('/auth/signout', { method: 'POST' });
    this.accessToken = null;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.request<User>('/auth/user');
    } catch {
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      return await this.request<Session>('/auth/session');
    } catch {
      return null;
    }
  }

  async refreshSession(): Promise<Session> {
    const response = await this.request<{ session: Session }>('/auth/refresh', {
      method: 'POST',
    });
    
    if (response.session) {
      this.accessToken = (response.session as any).accessToken;
    }
    
    return response.session;
  }

  async updateUser(request: UpdateUserRequest): Promise<User> {
    return this.request<User>('/auth/user', {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async changePassword(request: PasswordChangeRequest): Promise<void> {
    await this.request('/auth/password/change', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    await this.request('/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async confirmPasswordReset(request: PasswordResetConfirmRequest): Promise<void> {
    await this.request('/auth/password/reset/confirm', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // OAuth methods
  async oauthSignIn(request: OAuthSignInRequest): Promise<string> {
    const response = await this.request<{ url: string }>(`/auth/oauth/${request.provider}/initialize`, {
      method: 'POST',
      body: JSON.stringify({
        redirectUri: request.redirectUri,
        state: request.state,
        scope: request.scope,
      }),
    });
    return response.url;
  }

  async oauthCallback(request: OAuthCallbackRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>(`/auth/oauth/${request.provider}/callback`, {
      method: 'POST',
      body: JSON.stringify({ code: request.code, state: request.state }),
    });
    
    if (response.session) {
      this.accessToken = (response.session as any).accessToken;
    }
    
    return response;
  }

  async getOAuthProviders(): Promise<OAuthProvider[]> {
    const response = await this.request<{ providers: OAuthProvider[] }>('/auth/oauth/providers');
    return response.providers;
  }

  // Magic link methods
  async sendMagicLink(request: MagicLinkRequest): Promise<void> {
    await this.request('/auth/magic-link/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async verifyMagicLink(request: MagicLinkVerifyRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/magic-link/verify', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    if (response.session) {
      this.accessToken = (response.session as any).accessToken;
    }
    
    return response;
  }

  // Phone auth methods
  async sendPhoneCode(request: PhoneAuthRequest): Promise<void> {
    await this.request('/auth/phone/send', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async verifyPhoneCode(request: PhoneVerifyRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/phone/verify', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    if (response.session) {
      this.accessToken = (response.session as any).accessToken;
    }
    
    return response;
  }

  // 2FA methods
  async setupTwoFactor(request: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse> {
    return this.request<TwoFactorSetupResponse>('/auth/2fa/setup', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async verifyTwoFactor(request: TwoFactorVerifyRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    if (response.session) {
      this.accessToken = (response.session as any).accessToken;
    }
    
    return response;
  }

  async disableTwoFactor(): Promise<void> {
    await this.request('/auth/2fa/disable', {
      method: 'POST',
    });
  }

  async getTwoFactorStatus(): Promise<TwoFactorMethod[]> {
    const response = await this.request<{ methods: TwoFactorMethod[] }>('/auth/2fa/status');
    return response.methods;
  }

  // Passkey methods
  async registerPasskey(request: PasskeyRegisterRequest): Promise<PasskeyCredential> {
    return this.request<PasskeyCredential>('/auth/passkey/register', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async authenticatePasskey(request: PasskeyAuthRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/passkey/authenticate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    if (response.session) {
      this.accessToken = (response.session as any).accessToken;
    }
    
    return response;
  }

  async listPasskeys(): Promise<PasskeyCredential[]> {
    return this.request<PasskeyCredential[]>('/auth/passkey/list');
  }

  async deletePasskey(credentialId: string): Promise<void> {
    await this.request(`/auth/passkey/${credentialId}`, {
      method: 'DELETE',
    });
  }

  // Dynamic signup fields
  async getSignupFields(): Promise<FieldDefinition[]> {
    this.ensureInitialized();
    return this.signupFields || [];
  }

  // Error handling
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

export default AuthSomeAdapter;

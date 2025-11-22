/**
 * AuthSome adapter for AuthSome UI
 * 
 * Uses the official @authsome/client SDK with optional plugin support
 * for extended authentication features.
 */

import { AuthError, AuthErrorType } from '@authsome/ui-core';
import type {
  AuthProvider,
  User,
  Session,
  SessionData,
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
  RequestContext,
  CookieData,
} from '@authsome/ui-core';

// Import AuthsomeClient and plugin types
import { 
  AuthsomeClient,
  SocialPlugin,
  MagiclinkPlugin,
  PhonePlugin,
  TwofaPlugin,
  PasskeyPlugin,
  MfaPlugin,
  ClientPlugin,
} from '@authsome/client';

// Import type mappers
import {
  mapClientUserToCore,
  mapCoreUserToClient,
  mapClientSessionToCore,
  mapClientAuthResponseToCore,
  mapCoreSignInRequestToClient,
  mapCoreSignUpRequestToClient,
  extractToken,
} from './type-mappers';

export interface AuthSomeAdapterConfig extends ProviderConfig {
  /**
   * Base URL of your AuthSome API
   * @example "https://auth.yourapp.com"
   */
  apiUrl: string;
  
  /**
   * Base path prefix for all API routes
   * @example "/api/auth"
   * @default ""
   */
  basePath?: string;
  
  /**
   * API key for authentication (optional, deprecated)
   * @deprecated Use publishableKey or secretKey instead
   */
  apiKey?: string;

  /**
   * Publishable API key for client-side authentication (pk_*)
   * Safe to expose in browser/mobile apps with limited permissions
   */
  publishableKey?: string;

  /**
   * Secret API key for server-side authentication (sk_*)
   * WARNING: Keep this secret! Never expose in client-side code
   */
  secretKey?: string;

  /**
   * Authentication mode
   * - 'bearer': Use bearer token authentication (default)
   * - 'cookies': Use cookie-based authentication
   * - 'apiKey': Use API key authentication (publishableKey or secretKey)
   * @default 'bearer'
   */
  authMode?: 'bearer' | 'cookies' | 'apiKey';

  /**
   * Optional plugins to enable
   * Available plugins: 'social', 'passkey', 'magiclink', 'twofa', 'phone', 'mfa'
   * @example ['social', 'passkey', 'twofa']
   */
  plugins?: string[];

  /**
   * Request timeout in milliseconds (default: 30000)
   */
  timeout?: number;
}

/**
 * AuthSome adapter implementation
 * 
 * Uses the official @authsome/client SDK with plugin support.
 * All methods rely on the client SDK - no fallback manual requests.
 */
export class AuthSomeAdapter implements AuthProvider {
  readonly name = 'authsome';
  
  private config: AuthSomeAdapterConfig | null = null;
  private client: AuthsomeClient | null = null;
  private initialized = false;
  private signupFields: FieldDefinition[] | null = null;
  
  // Plugin instances
  private socialPlugin: SocialPlugin | null = null;
  private magiclinkPlugin: MagiclinkPlugin | null = null;
  private phonePlugin: PhonePlugin | null = null;
  private twofaPlugin: TwofaPlugin | null = null;
  private passkeyPlugin: PasskeyPlugin | null = null;
  private mfaPlugin: MfaPlugin | null = null;

  // Edge runtime context support  
  private _context: RequestContext | null = null;
  private _cookies: CookieData[] = [];

  /**
   * Get the underlying AuthsomeClient instance
   * Useful for direct access to the client SDK
   */
  getClient(): AuthsomeClient {
    this.ensureInitialized();
    return this.client!;
  }

  /**
   * Get the context for the adapter
   * @returns The context for the adapter
   */
  getContext(): RequestContext | null {
    return this._context;
  }

  /**
   * Get the current adapter configuration
   */
  getConfig(): AuthSomeAdapterConfig {
    this.ensureInitialized();
    return this.config!;
  }

  /**
   * Get a specific plugin instance using type-safe registry
   */
  getPlugin<T extends ClientPlugin>(pluginId: string): T | undefined {
    this.ensureInitialized();
    
    // Return cached plugin instances
    return this.client?.getPlugin<T>(pluginId);
  }

  async initialize(config: ProviderConfig): Promise<void> {
    this.config = config as AuthSomeAdapterConfig;
    
    if (!this.config.apiUrl) {
      throw new Error('AuthSome adapter requires apiUrl in config');
    }
    
    // Initialize plugins based on config
    const plugins = [];
    const enabledPlugins = this.config.plugins || [];
    
    if (enabledPlugins.includes('social')) {
      this.socialPlugin = new SocialPlugin();
      plugins.push(this.socialPlugin);
    }
    
    if (enabledPlugins.includes('magiclink')) {
      this.magiclinkPlugin = new MagiclinkPlugin();
      plugins.push(this.magiclinkPlugin);
    }
    
    if (enabledPlugins.includes('phone')) {
      this.phonePlugin = new PhonePlugin();
      plugins.push(this.phonePlugin);
    }
    
    if (enabledPlugins.includes('twofa')) {
      this.twofaPlugin = new TwofaPlugin();
      plugins.push(this.twofaPlugin);
    }
    
    if (enabledPlugins.includes('passkey')) {
      this.passkeyPlugin = new PasskeyPlugin();
      plugins.push(this.passkeyPlugin);
    }
    
    if (enabledPlugins.includes('mfa')) {
      this.mfaPlugin = new MfaPlugin();
      plugins.push(this.mfaPlugin);
    }
    
    // Initialize AuthsomeClient
    // Note: basePath will be supported in future client versions
    const clientConfig: any = {
      baseURL: this.config.apiUrl,
      plugins,
    };
    
    // Add basePath if provided (forward compatibility)
    if (this.config.basePath) {
      clientConfig.basePath = this.config.basePath;
    }
    
    this.client = new AuthsomeClient(clientConfig);
    
    // ALWAYS set API key to identify the AuthSome instance/tenant
    // This is required regardless of authMode (similar to Clerk)
    if (this.config.publishableKey) {
      this.client.setPublishableKey(this.config.publishableKey);
    } else if (this.config.secretKey) {
      this.client.setSecretKey(this.config.secretKey);
    } else if (this.config.apiKey) {
      // Fallback to deprecated apiKey
      this.client.setApiKey(this.config.apiKey);
    }
    
    // authMode controls how user tokens are managed:
    // - 'bearer': Tokens set after authentication and sent with requests
    // - 'cookies': Session managed via HTTP-only cookies
    // - 'apiKey': Uses API key for both identification AND authentication
    
    this.initialized = true;

    // Fetch signup fields configuration using client
    try {
      const response = await this.client.request<SignupFieldsResponse>('GET', '/signup/fields');
      this.signupFields = response.fields;
    } catch (error) {
      // Fields are optional, continue if endpoint doesn't exist
      console.debug('Signup fields endpoint not available');
      this.signupFields = [];
    }
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.config || !this.client) {
      throw new Error('AuthSome adapter not initialized. Call initialize() first.');
    }
  }

  private ensurePlugin(pluginName: string): void {
    this.ensureInitialized();
    const plugin = this.getPlugin(pluginName);
    if (!plugin) {
      throw new Error(
        `Plugin '${pluginName}' is not enabled. Add '${pluginName}' to the plugins array in your adapter configuration.`
      );
    }
  }

  async signIn(request: SignInRequest): Promise<AuthResponse> {
    this.ensureInitialized();
    
    try {
      const clientRequest = mapCoreSignInRequestToClient(request);
      const response = await this.client!.signIn(clientRequest);
      
      // Handle token management based on auth mode
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      return mapClientAuthResponseToCore(response);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async signUp(request: SignUpRequest): Promise<AuthResponse> {
    this.ensureInitialized();
    
    try {
      const clientRequest = mapCoreSignUpRequestToClient(request);
      const response = await this.client!.signUp(clientRequest);
      
      // Handle token management based on auth mode
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      return mapClientAuthResponseToCore(response);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async signOut(): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.signOut();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.getSession();
      return mapClientUserToCore(response.user);
    } catch {
      return null;
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.getSession();
      return mapClientSessionToCore(response.session);
    } catch {
      return null;
    }
  }

  async getCurrentSessionData(): Promise<SessionData | null> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.getSession();
      const user = mapClientUserToCore(response.user);
      const session = mapClientSessionToCore(response.session);
      
      // Calculate expiresAt timestamp from session
      const expiresAt = session.expiresAt 
        ? session.expiresAt.getTime() 
        : Date.now() + 24 * 60 * 60 * 1000; // Default to 24 hours if not set
      
      return {
        user,
        session,
        expiresAt,
      };
    } catch (error) {
      console.error('getCurrentSessionData error', error);
      // throw this.normalizeError(error);
      return null;
    }
  }

  async refreshSession(): Promise<Session> {
    this.ensureInitialized();
    
    try {
      // Use client to make the refresh request
      const response = await this.client!.request<{ session: Session }>('POST', '/auth/refresh', {
        auth: true,
      });
      
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      return response.session;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async updateUser(request: UpdateUserRequest): Promise<User> {
    this.ensureInitialized();
    
    try {
      const clientRequest = mapCoreUserToClient(request);
      const response = await this.client!.updateUser(clientRequest);
      return mapClientUserToCore(response.user);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async changePassword(request: PasswordChangeRequest): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.request('POST', '/auth/password/change', {
        body: request,
        auth: true,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.request('POST', '/auth/password/reset', {
        body: request,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async confirmPasswordReset(request: PasswordResetConfirmRequest): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.request('POST', '/auth/password/reset/confirm', {
        body: request,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // OAuth methods (requires Social Plugin)
  async oauthSignIn(request: OAuthSignInRequest): Promise<string> {
    this.ensurePlugin('social');
    
    try {
      const response = await this.socialPlugin!.signIn({
        provider: request.provider as string,
        redirectUrl: request.redirectUri || '',
        scopes: request.scope || [],
      } as any);
      return response.url;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async oauthCallback(_request: OAuthCallbackRequest): Promise<AuthResponse> {
    this.ensurePlugin('social');
    
    try {
      const response = await this.socialPlugin!.callback();
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response as any);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      // Map response if it has user/session
      if ((response as any).user && (response as any).session) {
        return mapClientAuthResponseToCore(response as any);
      }
      
      // If callback doesn't return full auth response, get current session
      const sessionResponse = await this.client!.getSession();
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async getOAuthProviders(): Promise<OAuthProvider[]> {
    this.ensurePlugin('social');
    
    try {
      const response = await this.socialPlugin!.listProviders();
      return response.providers as OAuthProvider[];
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Magic link methods (requires Magiclink Plugin)
  async sendMagicLink(request: MagicLinkRequest): Promise<void> {
    this.ensurePlugin('magiclink');
    
    try {
      await this.magiclinkPlugin!.send({ email: request.email });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async verifyMagicLink(_request: MagicLinkVerifyRequest): Promise<AuthResponse> {
    this.ensurePlugin('magiclink');
    
    try {
      const response = await this.magiclinkPlugin!.verify();
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response as any);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      // Map response if it has the right structure
      if ((response as any).user && (response as any).session) {
        return mapClientAuthResponseToCore(response as any);
      }
      
      // If verify doesn't return full auth response, get current session
      const sessionResponse = await this.client!.getSession();
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Phone auth methods (requires Phone Plugin)
  async sendPhoneCode(request: PhoneAuthRequest): Promise<void> {
    this.ensurePlugin('phone');
    
    try {
      await this.phonePlugin!.sendCode({ phone: request.phone });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async verifyPhoneCode(request: PhoneVerifyRequest): Promise<AuthResponse> {
    this.ensurePlugin('phone');
    
    try {
      const response = await this.phonePlugin!.verify({
        phone: request.phone,
        code: request.code,
      } as any);
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      // Map response if it has user/session
      if (response.user && response.session) {
        return mapClientAuthResponseToCore(response as any);
      }
      
      // If verify doesn't return full auth response, get current session
      const sessionResponse = await this.client!.getSession();
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // 2FA methods (requires TwoFA Plugin)
  async setupTwoFactor(request: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse> {
    this.ensurePlugin('twofa');
    
    try {
      await this.twofaPlugin!.enable({
        method: request.method as string,
        user_id: '', // Will be inferred from session
      });
      
      // Return a basic response structure
      return {
        method: request.method,
        secret: '',
        qrCode: '',
        backupCodes: [],
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async verifyTwoFactor(request: TwoFactorVerifyRequest): Promise<AuthResponse> {
    this.ensurePlugin('twofa');
    
    try {
      await this.twofaPlugin!.verify({
        code: request.code,
        device_id: '',
        remember_device: false,
        user_id: '',
      });
      
      // Get current session after verification
      const sessionResponse = await this.client!.getSession();
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(sessionResponse);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async disableTwoFactor(): Promise<void> {
    this.ensurePlugin('twofa');
    
    try {
      await this.twofaPlugin!.disable({ user_id: '' });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async getTwoFactorStatus(): Promise<TwoFactorMethod[]> {
    this.ensurePlugin('twofa');
    
    try {
      const response = await this.twofaPlugin!.status({
        device_id: '',
        user_id: '',
      });
      
      // Map the response to TwoFactorMethod array
      const method = response.method as TwoFactorMethod;
      return response.enabled ? [method] : [];
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Passkey methods (requires Passkey Plugin)
  async registerPasskey(_request: PasskeyRegisterRequest): Promise<PasskeyCredential> {
    this.ensurePlugin('passkey');
    
    try {
      // Begin registration
      await this.passkeyPlugin!.beginRegister();
      
      // In a real implementation, this would handle the WebAuthn ceremony
      // For now, return a basic structure
      return {
        id: '',
        name: _request.name,
        createdAt: new Date(),
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async authenticatePasskey(_request: PasskeyAuthRequest): Promise<AuthResponse> {
    this.ensurePlugin('passkey');
    
    try {
      // Begin login
      await this.passkeyPlugin!.beginLogin();
      
      // In a real implementation, this would handle the WebAuthn ceremony
      // and then call finishLogin
      
      // Get current session after authentication
      const sessionResponse = await this.client!.getSession();
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(sessionResponse);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async listPasskeys(): Promise<PasskeyCredential[]> {
    this.ensurePlugin('passkey');
    
    try {
      // Use client to make the list request
      return await this.client!.request<PasskeyCredential[]>('GET', '/auth/passkey/list', {
        auth: true,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async deletePasskey(_credentialId: string): Promise<void> {
    this.ensurePlugin('passkey');
    
    try {
      await this.client!.request('DELETE', `/auth/passkey/${_credentialId}`, {
        auth: true,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Dynamic signup fields
  async getSignupFields(): Promise<FieldDefinition[]> {
    this.ensureInitialized();
    return this.signupFields || [];
  }

  // Edge runtime context methods
  setContext(context: RequestContext): void {
    this._context = context;
    this._cookies = []; // Reset cookies when context changes
    
    if (!this.client) {
      console.warn('[AuthSome Adapter] setContext called but client is not initialized');
      return;
    }
    
    // Build headers object to set on the client
    const headersToSet: Record<string, string> = {};
    
    // Add all context headers except Cookie (we'll handle that separately)
    if (context.headers) {
      Object.entries(context.headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'cookie') {
          headersToSet[key] = value;
        }
      });
    }
    
    // Build Cookie header from context cookies
    if (context.cookies && Object.keys(context.cookies).length > 0) {
      const cookieString = Object.entries(context.cookies)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
      
      if (cookieString) {
        headersToSet['Cookie'] = cookieString;
        console.info('[AuthSome Adapter] Setting Cookie header:', cookieString);
      }
    }
    
    // Set all headers at once using the correct method
    if (Object.keys(headersToSet).length > 0) {
      this.client.setGlobalHeaders(headersToSet, false);
      console.info('[AuthSome Adapter] Set global headers, Cookie included:', !!headersToSet['Cookie']);
    }
  }

  getCookies(): CookieData[] {
    return [...this._cookies]; // Return copy to prevent external modifications
  }

  clearContext(): void {
    this._context = null;
    this._cookies = [];
    
    if (this.client) {
      // Reset headers by replacing with empty object
      // This clears any headers that were set from the context
      this.client.setGlobalHeaders({}, false);
    }
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

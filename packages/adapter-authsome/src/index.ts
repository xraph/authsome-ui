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
  SendVerificationEmailRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  MFAFactor,
  EnrollMFAFactorRequest,
  VerifyMFAFactorRequest,
  MFAChallengeRequest,
  MFAChallengeResponse,
  Device,
  ListSessionsOptions,
  ListSessionsResponse,
  DeviceFlowInitiateRequest,
  DeviceFlowInitiateResponse,
  DeviceCodeVerifyRequest,
  DeviceCodeVerifyResponse,
  DeviceAuthorizeRequest,
  DeviceTokenPollRequest,
  DeviceTokenPollResponse,
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
  EmailverificationPlugin,
  ClientPlugin,
  IdverificationPlugin,
  MultiappPlugin,
  MultisessionPlugin,
  BackupauthPlugin,
  EmailotpPlugin,
  AnonymousPlugin,
  SsoPlugin,
  OrganizationPlugin,
  OidcproviderPlugin,
  // Error types
  AuthsomeError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  ConflictError,
  ServerError,
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
  private emailVerificationPlugin: EmailverificationPlugin | null = null;
  private idVerificationPlugin: IdverificationPlugin | null = null;
  private multiappPlugin: MultiappPlugin | null = null;
  private multisessionPlugin: MultisessionPlugin | null = null;
  private backupauthPlugin: BackupauthPlugin | null = null;
  private emailotpPlugin: EmailotpPlugin | null = null;
  private anonymousPlugin: AnonymousPlugin | null = null;
  private ssoPlugin: SsoPlugin | null = null;
  private organizationPlugin: OrganizationPlugin | null = null;
  private oidcproviderPlugin: OidcproviderPlugin | null = null;

  // Edge runtime context support  
  private _context: RequestContext | null = null;
  private _cookies: CookieData[] = [];
  private _rawSetCookieHeaders: string[] = [];
  private originalFetch: typeof fetch | null = null;
  private fetchInterceptorInstalled = false;

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
    const plugins: ClientPlugin[] = [];
    const enabledPlugins = [
      'social',
      'magiclink',
      'phone',
      'twofa',
      'passkey',
      'mfa',
      'emailverification',
      'idverification',
      'multiapp',
      'multisession',
      'backupauth',
      'emailotp',
      'anonymous',
      'sso',
      'organization',
      'oidcprovider',
    ];
    
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
    
    if (enabledPlugins.includes('emailverification')) {
      this.emailVerificationPlugin = new EmailverificationPlugin();
      plugins.push(this.emailVerificationPlugin);
    }

    if (enabledPlugins.includes('idverification')) {
      this.idVerificationPlugin = new IdverificationPlugin();
      plugins.push(this.idVerificationPlugin);
    }

    if (enabledPlugins.includes('multiapp')) {
      this.multiappPlugin = new MultiappPlugin();
      plugins.push(this.multiappPlugin);
    }

    if (enabledPlugins.includes('multisession')) {
      this.multisessionPlugin = new MultisessionPlugin();
      plugins.push(this.multisessionPlugin);
    }

    if (enabledPlugins.includes('backupauth')) {
      this.backupauthPlugin = new BackupauthPlugin();
      plugins.push(this.backupauthPlugin);
    }

    if (enabledPlugins.includes('emailotp')) {
      this.emailotpPlugin = new EmailotpPlugin();
      plugins.push(this.emailotpPlugin);
    }

    if (enabledPlugins.includes('anonymous')) {
      this.anonymousPlugin = new AnonymousPlugin();
      plugins.push(this.anonymousPlugin);
    }

    if (enabledPlugins.includes('sso')) {
      this.ssoPlugin = new SsoPlugin();
      plugins.push(this.ssoPlugin);
    }

    if (enabledPlugins.includes('organization')) {
      this.organizationPlugin = new OrganizationPlugin();
      plugins.push(this.organizationPlugin);
    }

    if (enabledPlugins.includes('oidcprovider')) {
      this.oidcproviderPlugin = new OidcproviderPlugin();
      plugins.push(this.oidcproviderPlugin);
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
  }

  private ensureInitialized(): void {
    if (!this.initialized || !this.config || !this.client) {
      throw new Error('AuthSome adapter not initialized. Call initialize() first.');
    }
  }

  private ensurePlugin(pluginName: string): void {
    this.ensureInitialized();
    const plugin = this.getPluginByName(pluginName);
    if (!plugin) {
      throw new Error(
        `Plugin '${pluginName}' is not enabled. Add '${pluginName}' to the plugins array in your adapter configuration.`
      );
    }
  }

  private getPluginByName(pluginName: string): ClientPlugin | null {
    switch (pluginName) {
      case 'social':
        return this.socialPlugin;
      case 'magiclink':
        return this.magiclinkPlugin;
      case 'phone':
        return this.phonePlugin;
      case 'twofa':
        return this.twofaPlugin;
      case 'passkey':
        return this.passkeyPlugin;
      case 'mfa':
        return this.mfaPlugin;
      case 'emailverification':
        return this.emailVerificationPlugin;
      case 'idverification':
        return this.idVerificationPlugin;
      case 'multiapp':
        return this.multiappPlugin;
      case 'multisession':
        return this.multisessionPlugin;
      case 'backupauth':
        return this.backupauthPlugin;
      case 'emailotp':
        return this.emailotpPlugin;
      case 'anonymous':
        return this.anonymousPlugin;
      case 'sso':
        return this.ssoPlugin;
      case 'organization':
        return this.organizationPlugin;
      case 'oidcprovider':
        return this.oidcproviderPlugin;
      default:
        return null;
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
      // Use client's getSession method which effectively refreshes the session
      const response = await this.client!.getSession();
      
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      return mapClientSessionToCore(response.session);
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
      await this.client!.changePassword({
        oldPassword: request.currentPassword,
        newPassword: request.newPassword,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async requestPasswordReset(request: PasswordResetRequest): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.requestPasswordReset({
        email: request.email,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async confirmPasswordReset(request: PasswordResetConfirmRequest): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.resetPassword({
        token: request.token,
        newPassword: request.password,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Validate a password reset token before showing the reset form
   * Returns true if the token is valid and not expired
   */
  async validatePasswordResetToken(token: string): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.validateResetToken({ token });
      return response.valid;
    } catch {
      return false;
    }
  }

  /**
   * Request an email change for the current user
   * A verification email will be sent to the new email address
   */
  async requestEmailChange(newEmail: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.requestEmailChange({ newEmail });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Confirm an email change using the token sent to the new email
   */
  async confirmEmailChange(token: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.confirmEmailChange({ token });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Refresh the session using a refresh token
   * Returns the new access token and session
   */
  async refreshSessionWithToken(refreshToken: string): Promise<{ 
    accessToken: string; 
    refreshToken: string;
    expiresAt: Date;
    session: Session;
  }> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.refreshSession({ refreshToken });
      
      // Update the client token
      if (response.accessToken) {
        this.client!.setToken(response.accessToken);
      }
      
      return {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresAt: new Date(response.expiresAt),
        session: mapClientSessionToCore(response.session),
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // OAuth methods (requires Social Plugin)
  async oauthSignIn(request: OAuthSignInRequest): Promise<string> {
    this.ensurePlugin('social');
    
    try {
      // Use direct client request for OAuth sign-in since the plugin SignInRequest
      // type doesn't match OAuth requirements (provider, redirectUrl, scopes)
      const response = await this.client!.request<{ url: string }>('POST', '/signin/social', {
        body: {
          provider: request.provider,
          redirectUrl: request.redirectUri || '',
          scopes: request.scope ? (Array.isArray(request.scope) ? request.scope : [request.scope]) : [],
        },
      });
      return response.url;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async oauthCallback(request: OAuthCallbackRequest): Promise<AuthResponse> {
    this.ensurePlugin('social');
    
    try {
      console.log('[OAuth Callback] Starting OAuth callback for provider:', request.provider);
      console.log('[OAuth Callback] Request details:', { provider: request.provider, hasCode: !!request.code, hasState: !!request.state });
      console.log('[OAuth Callback] Current cookies before call:', this._cookies.length);
      
      // Use the social plugin's callback method
      // Returns CallbackDataResponse: { action, isNewUser, user }
      const response = await this.socialPlugin!.callback(
        { provider: request.provider },
        { 
          code: request.code, 
          state: request.state 
        }
      );
      
      console.log('[OAuth Callback] Response received from social plugin');
      console.log('[OAuth Callback] Response action:', response.action, 'isNewUser:', response.isNewUser);
      console.log('[OAuth Callback] Cookies after call:', this._cookies.length);
      
      // The callback returns CallbackDataResponse which has user but not session
      // We need to get the current session to build the full auth response
      const sessionResponse = await this.client!.getSession();
      console.log('[OAuth Callback] Session fetched, cookies now:', this._cookies.length);
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      console.log('[OAuth Callback] Auth mode:', authMode);
      
      if (authMode === 'bearer') {
        const token = extractToken(sessionResponse);
        if (token) {
          console.log('[OAuth Callback] Token extracted, setting on client');
          this.client!.setToken(token);
        }
      }
      
      // Build auth response
      const authResponse = mapClientAuthResponseToCore(sessionResponse);
      
      // Log if this was a new user signup (useful for analytics)
      if (response.isNewUser) {
        console.log('[OAuth Callback] New user created via OAuth');
      }
      
      return authResponse;
    } catch (error) {
      console.error('[OAuth Callback] Error during OAuth callback:', error);
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
  // Note: Phone plugin verify/signIn methods have empty VerifyRequest type,
  // so we use direct client requests for actual verification with code
  async sendPhoneCode(request: PhoneAuthRequest): Promise<void> {
    this.ensurePlugin('phone');
    
    try {
      // SendCodeRequest: { phone }
      await this.phonePlugin!.sendCode({ 
        phone: request.phone 
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async verifyPhoneCode(request: PhoneVerifyRequest): Promise<AuthResponse> {
    this.ensurePlugin('phone');
    
    try {
      // Use direct client request since plugin VerifyRequest is empty
      // PhoneVerifyResponse: { user, session, token }
      const response = await this.client!.request<{ user: any; session: any; token?: string }>('POST', '/phone/verify', {
        body: {
          phone: request.phone,
          code: request.code,
        },
      });
      
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
        return mapClientAuthResponseToCore(response);
      }
      
      // If verify doesn't return full auth response, get current session
      const sessionResponse = await this.client!.getSession();
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Sign in with phone number and verification code
   * Alternative to verifyPhoneCode that explicitly creates a new session
   */
  async phoneSignIn(request: PhoneVerifyRequest): Promise<AuthResponse> {
    this.ensurePlugin('phone');
    
    try {
      // PhoneVerifyResponse: { user, session, token }
      const response = await this.client!.request<{ user: any; session: any; token?: string }>('POST', '/phone/signin', {
        body: {
          phone: request.phone,
          code: request.code,
        },
      });
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      // Map response
      if (response.user && response.session) {
        return mapClientAuthResponseToCore(response);
      }
      
      // Fallback to current session
      const sessionResponse = await this.client!.getSession();
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // 2FA methods (requires TwoFA Plugin)
  // Note: TwoFA plugin methods now take no parameters - auth context comes from session
  async setupTwoFactor(request: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse> {
    this.ensurePlugin('twofa');
    
    try {
      // Enable 2FA - method type is handled by backend based on configuration
      await this.twofaPlugin!.enable();
      
      // Generate backup codes for the user
      let backupCodes: string[] = [];
      try {
        const codesResponse = await this.twofaPlugin!.generateBackupCodes();
        backupCodes = codesResponse.codes || [];
      } catch {
        // Backup codes generation is optional
      }
      
      // Return a basic response structure
      return {
        method: request.method,
        secret: '',
        qrCode: '',
        backupCodes,
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async verifyTwoFactor(_request: TwoFactorVerifyRequest): Promise<AuthResponse> {
    this.ensurePlugin('twofa');
    
    try {
      // Verify 2FA code - the code should be passed via headers or handled by backend session
      // For code verification, we need to use direct client request since plugin doesn't accept code
      await this.client!.request('POST', '/2fa/verify', {
        body: { code: _request.code },
        auth: true,
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
      await this.twofaPlugin!.disable();
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async getTwoFactorStatus(): Promise<TwoFactorMethod[]> {
    this.ensurePlugin('twofa');
    
    try {
      const response = await this.twofaPlugin!.status();
      
      // Map the response to TwoFactorMethod array
      const method = response.method as TwoFactorMethod;
      return response.enabled ? [method] : [];
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Generate new backup codes for 2FA
   * Requires TwoFA plugin
   */
  async generateTwoFactorBackupCodes(): Promise<string[]> {
    this.ensurePlugin('twofa');
    
    try {
      const response = await this.twofaPlugin!.generateBackupCodes();
      return response.codes || [];
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Send OTP code for 2FA verification
   * Requires TwoFA plugin
   */
  async sendTwoFactorOTP(): Promise<{ code?: string; status: string }> {
    this.ensurePlugin('twofa');
    
    try {
      const response = await this.twofaPlugin!.sendOTP();
      return { code: response.code, status: response.status };
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
      // Use passkey plugin's list method
      await this.passkeyPlugin!.list();
      // Note: The plugin method doesn't return the expected type, 
      // this may need adjustment based on actual API response
      return [];
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async deletePasskey(_credentialId: string): Promise<void> {
    this.ensurePlugin('passkey');
    
    try {
      // Use passkey plugin's delete method
      await this.passkeyPlugin!.delete({ id: _credentialId });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Dynamic signup fields
  async getSignupFields(): Promise<FieldDefinition[]> {
    this.ensureInitialized();
    
    // Lazy load signup fields on first call (only when actually needed in signup mode)
    if (this.signupFields === null) {
      try {
        const response = await this.client!.request<SignupFieldsResponse>('GET', '/signup/fields');
        this.signupFields = response.fields;
      } catch {
        // Fields are optional, continue if endpoint doesn't exist
        this.signupFields = [];
      }
    }
    
    return this.signupFields ?? [];
  }

  // Edge runtime context methods
  setContext(context: RequestContext): void {
    this._context = context;
    this._cookies = []; // Reset cookies when context changes
    this._rawSetCookieHeaders = []; // Reset raw headers when context changes
    
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
    
    // Install fetch interceptor to capture Set-Cookie headers from responses
    this.installFetchInterceptor();
  }

  getCookies(): CookieData[] {
    return [...this._cookies]; // Return copy to prevent external modifications
  }

  getRawSetCookieHeaders(): string[] {
    return [...this._rawSetCookieHeaders]; // Return copy to prevent external modifications
  }

  clearContext(): void {
    this._context = null;
    this._cookies = [];
    this._rawSetCookieHeaders = [];
    
    if (this.client) {
      // Reset headers by replacing with empty object
      // This clears any headers that were set from the context
      this.client.setGlobalHeaders({}, false);
    }
    
    // Restore original fetch if it was intercepted
    this.uninstallFetchInterceptor();
  }

  /**
   * Install fetch interceptor to capture Set-Cookie headers
   * Only installed when setContext is called (i.e., in middleware/server context)
   */
  private installFetchInterceptor(): void {
    if (typeof globalThis.fetch === 'undefined') {
      console.warn('[AuthSome Adapter] globalThis.fetch is undefined, cannot install interceptor');
      return; // No fetch to intercept
    }
    
    // Check if we've already installed our interceptor to avoid double-wrapping
    if (this.fetchInterceptorInstalled) {
      console.log('[AuthSome Adapter] Fetch interceptor already installed for this adapter instance, skipping');
      return;
    }
    
    // Check if another adapter instance already installed an interceptor
    if ((globalThis.fetch as any).__authsomeInterceptor) {
      console.log('[AuthSome Adapter] Another AuthSome interceptor already installed globally, skipping');
      return;
    }
    
    // Save original fetch - must be done before replacing globalThis.fetch
    // Store the current globalThis.fetch before we replace it
    this.originalFetch = globalThis.fetch;
    console.log('[AuthSome Adapter] Saved original fetch');
    
    // Create interceptor that captures Set-Cookie headers
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const interceptor = async (...args: Parameters<typeof fetch>): Promise<Response> => {
      const url = args[0] instanceof Request ? args[0].url : String(args[0]);
      console.log('[Fetch Interceptor] Request to:', url);
      
      // Defensive check: ensure originalFetch is actually a function
      // This protects against race conditions where clearContext is called during a fetch
      if (typeof self.originalFetch !== 'function') {
        console.error('[Fetch Interceptor] ERROR: originalFetch is not a function!');
        console.error('[Fetch Interceptor] This indicates a context lifecycle issue.');
        console.error('[Fetch Interceptor] Attempting to find a valid fetch implementation...');
        
        // Try to find native fetch by looking at the current globalThis.fetch
        // and checking if it has our marker
        let nativeFetch: typeof fetch | undefined;
        
        // Check if current globalThis.fetch is our interceptor
        if ((globalThis.fetch as any).__authsomeInterceptor) {
          // We're in trouble - we can't call ourselves
          console.error('[Fetch Interceptor] globalThis.fetch is still our interceptor but originalFetch is gone!');
          throw new Error(
            'Fetch interceptor error: originalFetch is null but interceptor is still installed. ' +
            'This is likely caused by calling clearContext() while fetch requests are pending. ' +
            'Please ensure proper lifecycle management of the adapter context.'
          );
        } else {
          // globalThis.fetch has been restored or replaced, use it
          nativeFetch = globalThis.fetch;
        }
        
        if (!nativeFetch) {
          throw new Error('No fetch implementation available');
        }
        
        const response = await nativeFetch(...args);
        return response;
      }
      
      const response = await self.originalFetch(...args);
      
      // Log all response headers
      console.log('[Fetch Interceptor] Response status:', response.status);
      console.log('[Fetch Interceptor] Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Capture Set-Cookie headers from response
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        console.log('[Fetch Interceptor] Set-Cookie header found:', setCookieHeader);
        
        // Store raw Set-Cookie header
        self._rawSetCookieHeaders.push(setCookieHeader);
        console.log('[Fetch Interceptor] Stored raw Set-Cookie header, total:', self._rawSetCookieHeaders.length);
        
        // Also parse for backward compatibility
        self.extractCookiesFromSetCookieHeader(setCookieHeader);
      } else {
        console.log('[Fetch Interceptor] No Set-Cookie header in response');
      }
      
      return response;
    };
    
    // Mark the interceptor so we can identify it later
    (interceptor as any).__authsomeInterceptor = true;
    
    globalThis.fetch = interceptor as typeof fetch;
    this.fetchInterceptorInstalled = true;
    
    console.log('[AuthSome Adapter] Fetch interceptor installed successfully');
  }

  /**
   * Restore original fetch
   */
  private uninstallFetchInterceptor(): void {
    if (this.originalFetch && this.fetchInterceptorInstalled) {
      console.log('[AuthSome Adapter] Uninstalling fetch interceptor');
      globalThis.fetch = this.originalFetch;
      this.originalFetch = null;
      this.fetchInterceptorInstalled = false;
      console.log('[AuthSome Adapter] Fetch interceptor uninstalled');
    }
  }

  /**
   * Extract cookies from Set-Cookie header and store in _cookies array
   */
  private extractCookiesFromSetCookieHeader(setCookieHeader: string): void {
    console.log('[Cookie Extractor] Raw Set-Cookie header:', setCookieHeader);
    
    // Split by comma but be careful about dates (e.g., "Expires=Wed, 21 Oct 2015")
    // For simplicity, we'll parse the first cookie directive
    const cookieParts = setCookieHeader.split(';').map(p => p.trim());
    console.log('[Cookie Extractor] Cookie parts:', cookieParts);
    
    if (cookieParts.length === 0) {
      console.log('[Cookie Extractor] No cookie parts found');
      return;
    }
    
    const [nameValue] = cookieParts;
    const equalIndex = nameValue.indexOf('=');
    if (equalIndex === -1) {
      console.log('[Cookie Extractor] No = found in cookie');
      return;
    }
    
    const name = nameValue.substring(0, equalIndex);
    const value = nameValue.substring(equalIndex + 1);
    console.log('[Cookie Extractor] Parsed name:', name, 'value:', value);
    
    if (!name || value === undefined) {
      console.log('[Cookie Extractor] Invalid cookie name/value');
      return;
    }
    
    const cookieData: CookieData = { name, value };
    const options: CookieData['options'] = {};
    
    // Parse cookie attributes
    for (let i = 1; i < cookieParts.length; i++) {
      const part = cookieParts[i];
      const lowerPart = part.toLowerCase();
      
      if (lowerPart === 'httponly') {
        options.httpOnly = true;
      } else if (lowerPart === 'secure') {
        options.secure = true;
      } else if (lowerPart.startsWith('path=')) {
        options.path = part.substring(5);
      } else if (lowerPart.startsWith('domain=')) {
        options.domain = part.substring(7);
      } else if (lowerPart.startsWith('max-age=')) {
        const maxAge = parseInt(part.substring(8), 10);
        if (!isNaN(maxAge)) {
          options.maxAge = maxAge;
        }
      } else if (lowerPart.startsWith('samesite=')) {
        const sameSiteValue = lowerPart.substring(9) as 'strict' | 'lax' | 'none';
        if (['strict', 'lax', 'none'].includes(sameSiteValue)) {
          options.sameSite = sameSiteValue;
        }
      }
    }
    
    if (Object.keys(options).length > 0) {
      cookieData.options = options;
    }
    
    console.log('[Cookie Extractor] Parsed cookie data:', JSON.stringify(cookieData, null, 2));
    
    // Add to cookies array (replace if same name exists)
    const existingIndex = this._cookies.findIndex(c => c.name === name);
    if (existingIndex >= 0) {
      console.log('[Cookie Extractor] Replacing existing cookie:', name);
      this._cookies[existingIndex] = cookieData;
    } else {
      console.log('[Cookie Extractor] Adding new cookie:', name);
      this._cookies.push(cookieData);
    }
    
    console.log('[Cookie Extractor] Total cookies stored:', this._cookies.length);
    console.info('[AuthSome Adapter] Captured cookie:', name);
  }

  // Email Verification methods
  async sendVerificationEmail(request: SendVerificationEmailRequest): Promise<void> {
    this.ensurePlugin('emailverification');
    
    try {
      await this.emailVerificationPlugin!.send({ email: request.email });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async verifyEmail(request: VerifyEmailRequest): Promise<void> {
    this.ensurePlugin('emailverification');
    this.ensureInitialized();

    try {
      // Plugin.verify() expects a different VerifyRequest shape (email/phone/remember).
      // Use direct client request to pass token/code for link or OTP verification.
      const body: { token?: string; code?: string } = {};
      if (request.token) body.token = request.token;
      if (request.code != null) body.code = request.code;
      if (Object.keys(body).length === 0) {
        throw new Error('VerifyEmailRequest must include token or code');
      }
      await this.client!.request('POST', '/email-verification/verify', {
        body,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async resendVerificationEmail(request: ResendVerificationRequest): Promise<void> {
    this.ensurePlugin('emailverification');
    
    try {
      await this.emailVerificationPlugin!.resend({ email: request.email });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Advanced MFA methods
  async enrollMFAFactor(request: EnrollMFAFactorRequest): Promise<MFAFactor> {
    this.ensurePlugin('mfa');
    
    try {
      await this.mfaPlugin!.enrollFactor({
        type: request.type,
        name: request.name,
        metadata: request.metadata || {},
        priority: 'normal',
      });
      
      // Return the enrolled factor - need to fetch after enrollment
      const factors = await this.mfaPlugin!.listFactors();
      const enrolledFactor = factors.factors.find((f: any) => f.name === request.name);
      
      if (!enrolledFactor) {
        throw new AuthError('Failed to retrieve enrolled factor', AuthErrorType.UNKNOWN_ERROR);
      }
      
      return this.mapClientFactorToCore(enrolledFactor);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async listMFAFactors(): Promise<MFAFactor[]> {
    this.ensurePlugin('mfa');
    
    try {
      const response = await this.mfaPlugin!.listFactors();
      return response.factors.map((f: any) => this.mapClientFactorToCore(f));
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async getMFAFactor(factorId: string): Promise<MFAFactor> {
    this.ensurePlugin('mfa');
    
    try {
      const factor = await this.mfaPlugin!.getFactor({ id: factorId }) as any;
      return this.mapClientFactorToCore(factor);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async deleteMFAFactor(factorId: string): Promise<void> {
    this.ensurePlugin('mfa');
    
    try {
      await this.mfaPlugin!.deleteFactor({ id: factorId });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async verifyMFAFactor(request: VerifyMFAFactorRequest): Promise<void> {
    this.ensurePlugin('mfa');
    
    try {
      // The MFA plugin verifyFactor only takes { id } param, no body
      // We need to use direct client request to pass the verification code
      await this.client!.request('POST', `/mfa/factors/${request.factorId}/verify`, {
        body: { code: request.code },
        auth: true,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async initiateMFAChallenge(request: MFAChallengeRequest): Promise<MFAChallengeResponse> {
    this.ensurePlugin('mfa');
    
    try {
      // ChallengeRequest: { userId, context, factorTypes, metadata }
      const challengeResponse = await this.mfaPlugin!.initiateChallenge({
        userId: request.userId || '',
        context: '', // Optional context for the challenge
        factorTypes: request.factorTypes || [],
        metadata: {}, // Optional metadata
      });
      
      // Map challenge response factors to MFAFactor
      const availableFactors = challengeResponse.availableFactors.map((f: { factorId: string; type: string; name: string; metadata?: Record<string, unknown> }) => ({
        id: f.factorId,
        type: f.type,
        name: f.name,
        status: 'verified' as const,
        createdAt: new Date(),
        metadata: f.metadata,
      }));
      
      return {
        challengeId: challengeResponse.challengeId,
        availableFactors,
        expiresAt: new Date(challengeResponse.expiresAt),
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async getMFAStatus(): Promise<{ enabled: boolean; factors: MFAFactor[]; requiredCount: number; trustedDevice: boolean }> {
    this.ensurePlugin('mfa');
    
    try {
      // MFAStatus: { enabled, enrolledFactors, gracePeriod, policyActive, requiredCount, trustedDevice }
      const status = await this.mfaPlugin!.getStatus();
      
      // Map enrolled factors to MFAFactor
      const factors = status.enrolledFactors.map((f: { factorId: string; type: string; name: string; metadata?: Record<string, unknown> }) => ({
        id: f.factorId,
        type: f.type,
        name: f.name,
        status: 'verified' as const,
        createdAt: new Date(),
        metadata: f.metadata,
      }));
      
      return {
        enabled: status.enabled,
        factors,
        requiredCount: status.requiredCount,
        trustedDevice: status.trustedDevice,
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Device Management methods
  async listDevices(): Promise<Device[]> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.listDevices();
      return response.devices.map((d: any) => this.mapClientDeviceToCore(d));
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async revokeDevice(deviceId: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.revokeDevice({ fingerprint: deviceId });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async trustDevice(deviceId: string, name?: string, metadata?: Record<string, unknown>): Promise<void> {
    this.ensurePlugin('mfa');
    
    try {
      // TrustDeviceRequest: { deviceId, name, metadata }
      await this.client!.request('POST', '/mfa/devices/trust', {
        body: {
          deviceId,
          name: name || 'Trusted Device',
          metadata: metadata || {},
        },
        auth: true,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async listTrustedDevices(): Promise<Device[]> {
    this.ensurePlugin('mfa');
    
    try {
      // DevicesResponse: { count, devices: any }
      const response = await this.mfaPlugin!.listTrustedDevices();
      // Handle both array and object responses
      const devices = Array.isArray(response.devices) ? response.devices : [];
      return devices.map((d: any) => this.mapTrustedDeviceToCore(d));
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async revokeTrustedDevice(deviceId: string): Promise<void> {
    this.ensurePlugin('mfa');
    
    try {
      await this.mfaPlugin!.revokeTrustedDevice({ id: deviceId });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Session Management methods
  /**
   * List sessions with optional filtering and pagination
   * 
   * @param options - Optional filter and pagination parameters
   * @returns Paginated session list with metadata
   */
  async listSessions(options?: ListSessionsOptions): Promise<ListSessionsResponse> {
    this.ensureInitialized();
    
    try {
      // Build request with optional filters
      const request: {
        active?: boolean;
        ipAddress?: string;
        userAgent?: string;
        createdFrom?: string;
        createdTo?: string;
        sortBy?: string;
        sortOrder?: string;
        limit: number;
        offset: number;
      } = {
        limit: options?.limit ?? 50,
        offset: options?.offset ?? 0,
      };

      // Add optional filters
      if (options?.active !== undefined) {
        request.active = options.active;
      }
      if (options?.ipAddress) {
        request.ipAddress = options.ipAddress;
      }
      if (options?.userAgent) {
        request.userAgent = options.userAgent;
      }
      if (options?.createdFrom) {
        request.createdFrom = options.createdFrom instanceof Date 
          ? options.createdFrom.toISOString() 
          : options.createdFrom;
      }
      if (options?.createdTo) {
        request.createdTo = options.createdTo instanceof Date 
          ? options.createdTo.toISOString() 
          : options.createdTo;
      }
      if (options?.sortBy) {
        request.sortBy = options.sortBy;
      }
      if (options?.sortOrder) {
        request.sortOrder = options.sortOrder;
      }

      // Use multisession plugin for session list endpoint
      // Cast to bypass client's strict type (all fields marked required but server accepts partial)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await this.multisessionPlugin!.list(request as any);
      
      // Handle type issue: sessions is typed as `Session | undefined[]` in client
      // but should be Session[]. Cast to work around the incorrect type definition.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessions = (response.sessions ?? []) as any[];
      if (!Array.isArray(sessions)) {
        return {
          sessions: [],
          total: 0,
          page: response.page ?? 1,
          totalPages: response.total_pages ?? 0,
          limit: request.limit,
        };
      }
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedSessions = sessions.map((s: any) => ({
        ...mapClientSessionToCore(s),
        device: s.device ? this.mapClientDeviceToCore(s.device) : undefined,
        location: s.location,
      }));

      return {
        sessions: mappedSessions,
        total: response.total ?? sessions.length,
        page: response.page ?? 1,
        totalPages: response.total_pages ?? 1,
        limit: request.limit,
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.request(
        'DELETE',
        `/sessions/${sessionId}`,
        { auth: true }
      );
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  async revokeAllSessions(): Promise<void> {
    this.ensureInitialized();
    
    try {
      await this.client!.request(
        'POST',
        '/sessions/revoke-all',
        { auth: true }
      );
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Email OTP methods (requires EmailOTP Plugin)
  /**
   * Send a one-time password to the user's email
   */
  async sendEmailOTP(email: string): Promise<{ status: string }> {
    this.ensurePlugin('emailotp');
    
    try {
      const response = await this.client!.request<{ status: string }>('POST', '/email-otp/send', {
        body: { email },
      });
      return response;
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Verify email OTP and authenticate
   */
  async verifyEmailOTP(email: string, code: string): Promise<AuthResponse> {
    this.ensurePlugin('emailotp');
    
    try {
      const response = await this.client!.request<{ user: any; session: any; token?: string }>('POST', '/email-otp/verify', {
        body: { email, code },
      });
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      if (response.user && response.session) {
        return mapClientAuthResponseToCore(response);
      }
      
      const sessionResponse = await this.client!.getSession();
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Anonymous Auth methods (requires Anonymous Plugin)
  /**
   * Create an anonymous session
   * Useful for guest users or temporary access
   */
  async createAnonymousSession(): Promise<AuthResponse> {
    this.ensurePlugin('anonymous');
    
    try {
      const response = await this.client!.request<{ user: any; session: any; token?: string }>('POST', '/anonymous/session', {});
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      if (response.user && response.session) {
        return mapClientAuthResponseToCore(response);
      }
      
      const sessionResponse = await this.client!.getSession();
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Convert an anonymous session to a full account
   */
  async convertAnonymousToUser(email: string, password: string, name?: string): Promise<AuthResponse> {
    this.ensurePlugin('anonymous');
    
    try {
      const response = await this.client!.request<{ user: any; session: any; token?: string }>('POST', '/anonymous/convert', {
        body: { email, password, name },
        auth: true,
      });
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      if (response.user && response.session) {
        return mapClientAuthResponseToCore(response);
      }
      
      const sessionResponse = await this.client!.getSession();
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // SSO methods (requires SSO Plugin)
  /**
   * Initiate SSO login with a provider
   */
  async initiateSSOLogin(providerId: string, redirectUri: string): Promise<{ redirectUrl: string }> {
    this.ensurePlugin('sso');
    
    try {
      const response = await this.client!.request<{ authUrl: string; state: string }>('POST', '/sso/login', {
        body: { providerId, redirectUri },
      });
      return { redirectUrl: response.authUrl };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Handle SSO callback
   */
  async handleSSOCallback(providerId: string, code: string, state: string): Promise<AuthResponse> {
    this.ensurePlugin('sso');
    
    try {
      const response = await this.client!.request<{ user: any; session: any; token?: string }>('GET', `/sso/callback/${providerId}`, {
        query: { code, state },
      });
      
      // Handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer') {
        const token = extractToken(response);
        if (token) {
          this.client!.setToken(token);
        }
      }
      
      if (response.user && response.session) {
        return mapClientAuthResponseToCore(response);
      }
      
      const sessionResponse = await this.client!.getSession();
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Account Recovery methods (requires Backupauth Plugin)
  /**
   * Start account recovery process
   */
  async startAccountRecovery(request: { 
    email?: string; 
    userId?: string; 
    preferredMethod?: string;
    deviceId?: string;
  }): Promise<{ 
    sessionId: string; 
    status: string;
    availableMethods: string[];
    requiredSteps: number;
  }> {
    this.ensurePlugin('backupauth');
    
    try {
      const response = await this.backupauthPlugin!.startRecovery({
        email: request.email || '',
        userId: request.userId || '',
        preferredMethod: request.preferredMethod || '',
        deviceId: request.deviceId || '',
      });
      return { 
        sessionId: response.session_id, 
        status: 'started',
        availableMethods: [],
        requiredSteps: 1,
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Continue account recovery with a specific method
   */
  async continueAccountRecovery(sessionId: string, method: string): Promise<{ 
    sessionId: string; 
    currentStep: number;
    instructions: string;
  }> {
    this.ensurePlugin('backupauth');
    
    try {
      const response = await this.backupauthPlugin!.continueRecovery({
        sessionId,
        method,
      });
      return { 
        sessionId: response.session_id,
        currentStep: 1,
        instructions: '',
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Complete account recovery
   */
  async completeAccountRecovery(sessionId: string): Promise<AuthResponse> {
    this.ensurePlugin('backupauth');
    
    try {
      await this.backupauthPlugin!.completeRecovery({ sessionId });
      
      // After recovery, get the new session
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

  /**
   * Generate recovery codes for account backup
   */
  async generateRecoveryCodes(count?: number): Promise<{ codes: string[] }> {
    this.ensurePlugin('backupauth');
    
    try {
      const response = await this.backupauthPlugin!.generateRecoveryCodes({
        count: count || 10,
        format: 'alphanumeric',
      });
      return { codes: response.codes };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Verify a recovery code
   */
  async verifyRecoveryCode(sessionId: string, code: string): Promise<{ valid: boolean; remainingCodes: number }> {
    this.ensurePlugin('backupauth');
    
    try {
      const response = await this.backupauthPlugin!.verifyRecoveryCode({
        sessionId,
        code,
      });
      return { 
        valid: response.status === 'success',
        remainingCodes: 0,
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Setup security questions for account recovery
   */
  async setupSecurityQuestions(questions: Array<{ questionId: number; answer: string; customText?: string }>): Promise<void> {
    this.ensurePlugin('backupauth');
    
    try {
      await this.backupauthPlugin!.setupSecurityQuestions({
        questions: questions.map(q => ({
          questionId: q.questionId,
          answer: q.answer,
          customText: q.customText || '',
        })),
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Get security questions for verification
   */
  async getSecurityQuestions(sessionId: string): Promise<{ questions: string[] }> {
    this.ensurePlugin('backupauth');
    
    try {
      const response = await this.backupauthPlugin!.getSecurityQuestions({ sessionId });
      return { questions: response.questions };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Verify security question answers
   */
  async verifySecurityAnswers(sessionId: string, answers: Record<string, string>): Promise<{ valid: boolean }> {
    this.ensurePlugin('backupauth');
    
    try {
      const response = await this.backupauthPlugin!.verifySecurityAnswers({
        sessionId,
        answers,
      });
      return { valid: response.status === 'success' };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  // Type mapping helpers
  private mapClientFactorToCore(factor: any): MFAFactor {
    return {
      id: factor.id,
      type: factor.type,
      name: factor.name,
      status: factor.status,
      createdAt: this.parseDate(factor.createdAt) || new Date(),
      metadata: factor.metadata,
    };
  }

  private mapClientDeviceToCore(device: any): Device {
    return {
      id: device.id || device.fingerprint,
      userId: device.userId || device.user_id,
      name: device.name || device.device_name,
      type: device.type || device.device_type,
      lastUsedAt: this.parseDate(device.lastUsedAt || device.last_used_at) || new Date(),
      ipAddress: device.ipAddress || device.ip_address,
      userAgent: device.userAgent || device.user_agent,
    };
  }

  private mapTrustedDeviceToCore(device: any): Device {
    return {
      id: device.id || device.deviceId,
      userId: device.userId,
      name: device.name || device.device_name,
      type: device.type,
      lastUsedAt: this.parseDate(device.lastUsedAt || device.last_used_at) || new Date(),
      ipAddress: device.ipAddress || device.ip_address,
      userAgent: device.userAgent || device.user_agent,
    };
  }

  private parseDate(dateValue: string | number | Date | undefined): Date | undefined {
    if (!dateValue) return undefined;
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    if (typeof dateValue === 'number') {
      return new Date(dateValue);
    }
    
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? undefined : parsed;
    }
    
    return undefined;
  }

  // Error handling
  /**
   * Normalize client errors to AuthError types
   * Maps AuthsomeError subclasses to appropriate AuthErrorType
   */
  normalizeError(error: unknown): AuthError {
    // Already an AuthError from ui-core
    if (error instanceof AuthError) {
      return error;
    }

    // Check for specific business logic error codes in AuthsomeError
    // These codes come from the API response body and indicate specific auth states
    if (error instanceof AuthsomeError) {
      const authsomeError = error as AuthsomeError & { 
        code?: string; 
        context?: Record<string, unknown> 
      };
      
      // Map specific business logic error codes to appropriate AuthErrorType
      switch (authsomeError.code) {
        case 'INVALID_CREDENTIALS':
        case 'INVALID_PASSWORD':
        case 'WRONG_PASSWORD':
          return new AuthError(
            authsomeError.message || 'Invalid email or password',
            AuthErrorType.INVALID_CREDENTIALS,
            { 
              originalError: error, 
              code: authsomeError.code,
              details: authsomeError.context 
            }
          );
        
        case 'USER_NOT_FOUND':
        case 'ACCOUNT_NOT_FOUND':
          return new AuthError(
            authsomeError.message || 'User not found',
            AuthErrorType.USER_NOT_FOUND,
            { 
              originalError: error, 
              code: authsomeError.code,
              details: authsomeError.context 
            }
          );
        
        case 'EMAIL_NOT_VERIFIED': {
          // Extract email from context for more helpful error message
          let emailMessage = authsomeError.message || 'Email address not verified';
          if (authsomeError.context && typeof authsomeError.context === 'object') {
            const email = (authsomeError.context as Record<string, unknown>).email;
            if (email && typeof email === 'string' && !emailMessage.includes(email)) {
              emailMessage += ` for ${email}`;
            }
          }
          return new AuthError(
            emailMessage,
            AuthErrorType.EMAIL_NOT_VERIFIED,
            { 
              originalError: error, 
              code: authsomeError.code,
              details: authsomeError.context 
            }
          );
        }
        
        case 'PHONE_NOT_VERIFIED':
          return new AuthError(
            authsomeError.message || 'Phone number not verified',
            AuthErrorType.PHONE_NOT_VERIFIED,
            { 
              originalError: error, 
              code: authsomeError.code,
              details: authsomeError.context 
            }
          );
        
        case 'MFA_REQUIRED':
        case 'TWO_FACTOR_REQUIRED':
          return new AuthError(
            authsomeError.message || 'Multi-factor authentication required',
            AuthErrorType.MFA_REQUIRED,
            { 
              originalError: error, 
              code: authsomeError.code,
              details: authsomeError.context 
            }
          );
        
        case 'ACCOUNT_LOCKED':
        case 'ACCOUNT_DISABLED':
        case 'ACCOUNT_SUSPENDED': {
          // Extract reason and lock duration from context for more helpful error message
          let accountMessage = authsomeError.message || 'Account is locked or disabled';
          if (authsomeError.context && typeof authsomeError.context === 'object') {
            const context = authsomeError.context as Record<string, unknown>;
            const reason = context.reason;
            const lockedMinutes = context.lockedMinutes;
            const lockedUntil = context.lockedUntil;
            
            // Build detailed message with all available information
            const details: string[] = [];
            
            if (reason && typeof reason === 'string') {
              details.push(reason);
            }
            
            if (lockedMinutes && typeof lockedMinutes === 'number') {
              details.push(`locked for ${lockedMinutes} minute${lockedMinutes !== 1 ? 's' : ''}`);
            } else if (lockedUntil && typeof lockedUntil === 'string') {
              // Parse the locked until time and calculate relative time
              try {
                const unlockDate = new Date(lockedUntil);
                const now = new Date();
                const minutesRemaining = Math.ceil((unlockDate.getTime() - now.getTime()) / 60000);
                if (minutesRemaining > 0) {
                  details.push(`try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`);
                } else {
                  details.push('you can try again now');
                }
              } catch {
                // If date parsing fails, just use the raw date string
                details.push(`locked until ${lockedUntil}`);
              }
            }
            
            if (details.length > 0) {
              accountMessage += `. ${details.join(', ')}.`;
            }
          }
          return new AuthError(
            accountMessage,
            AuthErrorType.INVALID_TOKEN,
            { 
              originalError: error, 
              code: authsomeError.code,
              details: authsomeError.context 
            }
          );
        }
        
        case 'RATE_LIMIT_EXCEEDED':
        case 'TOO_MANY_REQUESTS': {
          // Extract retry-after or wait time from context for more helpful error message
          let rateLimitMessage = authsomeError.message || 'Too many requests. Please try again later.';
          if (authsomeError.context && typeof authsomeError.context === 'object') {
            const retryAfter = (authsomeError.context as Record<string, unknown>).retryAfter || 
                              (authsomeError.context as Record<string, unknown>).retry_after ||
                              (authsomeError.context as Record<string, unknown>).waitTime;
            if (retryAfter) {
              if (typeof retryAfter === 'number') {
                const minutes = Math.ceil(retryAfter / 60);
                rateLimitMessage += ` Please wait ${minutes} minute${minutes !== 1 ? 's' : ''}.`;
              } else if (typeof retryAfter === 'string') {
                rateLimitMessage += ` ${retryAfter}`;
              }
            }
          }
          return new AuthError(
            rateLimitMessage,
            AuthErrorType.RATE_LIMIT_EXCEEDED,
            { 
              originalError: error, 
              code: authsomeError.code,
              details: authsomeError.context 
            }
          );
        }
      }
    }

    // Map AuthsomeError types to AuthErrorType based on HTTP status codes
    // UnauthorizedError (401) -> INVALID_TOKEN (authentication required)
    if (error instanceof UnauthorizedError) {
      return new AuthError(
        (error as UnauthorizedError).message || 'Unauthorized',
        AuthErrorType.INVALID_TOKEN,
        { originalError: error, code: (error as UnauthorizedError).code }
      );
    }

    // ForbiddenError (403) -> INVALID_TOKEN (insufficient permissions)
    if (error instanceof ForbiddenError) {
      return new AuthError(
        (error as ForbiddenError).message || 'Forbidden',
        AuthErrorType.INVALID_TOKEN,
        { originalError: error, code: (error as ForbiddenError).code }
      );
    }

    // ValidationError (400) -> VALIDATION_ERROR
    if (error instanceof ValidationError) {
      const validationError = error as ValidationError & { errors?: unknown };
      return new AuthError(
        validationError.message || 'Validation error',
        AuthErrorType.VALIDATION_ERROR,
        { originalError: error, code: validationError.code, details: validationError.errors as Record<string, unknown> }
      );
    }

    // NotFoundError (404) -> USER_NOT_FOUND
    if (error instanceof NotFoundError) {
      return new AuthError(
        (error as NotFoundError).message || 'Not found',
        AuthErrorType.USER_NOT_FOUND,
        { originalError: error, code: (error as NotFoundError).code }
      );
    }

    // RateLimitError (429) -> RATE_LIMIT_EXCEEDED
    if (error instanceof RateLimitError) {
      const rateLimitError = error as RateLimitError & { retryAfter?: number };
      return new AuthError(
        rateLimitError.message || 'Rate limited',
        AuthErrorType.RATE_LIMIT_EXCEEDED,
        { originalError: error, code: rateLimitError.code, details: { retryAfter: rateLimitError.retryAfter } }
      );
    }

    // ConflictError (409) -> USER_ALREADY_EXISTS
    if (error instanceof ConflictError) {
      return new AuthError(
        (error as ConflictError).message || 'Conflict',
        AuthErrorType.USER_ALREADY_EXISTS,
        { originalError: error, code: (error as ConflictError).code }
      );
    }

    // ServerError (5xx) -> NETWORK_ERROR
    if (error instanceof ServerError) {
      return new AuthError(
        (error as ServerError).message || 'Server error',
        AuthErrorType.NETWORK_ERROR,
        { originalError: error, code: (error as ServerError).code }
      );
    }

    // Generic AuthsomeError
    if (error instanceof AuthsomeError) {
      return new AuthError(
        (error as AuthsomeError).message || 'Authentication error',
        AuthErrorType.UNKNOWN_ERROR,
        { originalError: error, code: (error as AuthsomeError).code }
      );
    }
    
    // Fallback for unknown errors
    const message = (error as Error).message || 'Unknown error';
    const errorWithType = error as { type?: AuthErrorType };
    const type = errorWithType.type || AuthErrorType.UNKNOWN_ERROR;
    
    return new AuthError(message, type, {
      originalError: error,
    });
  }

  // Device Flow methods (RFC 8628 - OAuth 2.0 Device Authorization Grant)
  /**
   * Initiate device authorization flow
   * Used by CLI/device applications to start the authorization process
   * Returns device code, user code, and verification URI
   */
  async initiateDeviceFlow(request: DeviceFlowInitiateRequest): Promise<DeviceFlowInitiateResponse> {
    this.ensurePlugin('oidcprovider');
    
    try {
      const response = await this.oidcproviderPlugin!.deviceAuthorize({
        client_id: request.clientId,
        scope: request.scope || '',
      });
      
      return {
        deviceCode: response.device_code,
        userCode: response.user_code,
        verificationUri: response.verification_uri,
        verificationUriComplete: response.verification_uri_complete,
        expiresIn: response.expires_in,
        interval: response.interval,
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Verify a user-entered device code
   * Called by web UI when user enters the code shown on their device
   */
  async verifyDeviceCode(request: DeviceCodeVerifyRequest): Promise<DeviceCodeVerifyResponse> {
    this.ensurePlugin('oidcprovider');
    
    try {
      const response = await this.oidcproviderPlugin!.deviceVerify({
        user_code: request.userCode,
      });
      
      // Map backend response to frontend interface
      // Backend returns ScopeInfo[] with empty interface, but actual JSON has scope/description properties
      const scopes = response.scopes?.map((s: any) => s.scope || '') || [];
      
      return {
        valid: true,
        clientName: response.clientName,
        scopes: scopes.filter((scope: string) => scope !== ''),
        // expiresIn not provided by backend, would need device code lookup
      };
    } catch (error) {
      // Return invalid rather than throwing for invalid codes
      const normalizedError = this.normalizeError(error);
      if (normalizedError.type === AuthErrorType.VALIDATION_ERROR || 
          normalizedError.type === AuthErrorType.INVALID_TOKEN ||
          normalizedError.type === AuthErrorType.USER_NOT_FOUND) {
        return {
          valid: false,
        };
      }
      throw normalizedError;
    }
  }

  /**
   * Authorize or deny the device request
   * Called when user approves or denies the authorization
   */
  async authorizeDevice(request: DeviceAuthorizeRequest): Promise<void> {
    this.ensurePlugin('oidcprovider');
    
    try {
      await this.oidcproviderPlugin!.deviceAuthorizeDecision({
        action: request.action,
        user_code: request.userCode,
      });
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  /**
   * Poll for device token (used by CLI/device)
   * Returns auth response when authorized, or status when still pending
   */
  async pollDeviceToken(request: DeviceTokenPollRequest): Promise<AuthResponse | DeviceTokenPollResponse> {
    this.ensurePlugin('oidcprovider');
    
    try {
      // Use direct client request to bypass strict TokenRequest typing
      // The device_code grant type only requires these fields per RFC 8628
      const response = await this.client!.request<{
        access_token?: string;
        token_type?: string;
        expires_in?: number;
        refresh_token?: string;
        scope?: string;
        error?: string;
      }>('POST', '/token', {
        body: {
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          device_code: request.deviceCode,
          client_id: request.clientId,
        },
      });
      
      // If there's an error in the response (OAuth 2.0 error format)
      if (response.error) {
        return { status: response.error as DeviceTokenPollResponse['status'] };
      }
      
      // Successful token exchange - handle token management
      const authMode = this.config!.authMode || 'bearer';
      if (authMode === 'bearer' && response.access_token) {
        this.client!.setToken(response.access_token);
      }
      
      // Get session after token exchange
      const sessionResponse = await this.client!.getSession();
      return mapClientAuthResponseToCore(sessionResponse);
    } catch (error: unknown) {
      // Handle device flow specific errors
      const errorWithCode = error as { error?: string; code?: string };
      if (errorWithCode.error) {
        // RFC 8628 error codes: authorization_pending, slow_down, expired_token, access_denied
        return { status: errorWithCode.error as DeviceTokenPollResponse['status'] };
      }
      if (errorWithCode.code) {
        // Alternative error format
        const code = errorWithCode.code;
        if (code === 'authorization_pending' || code === 'slow_down' || 
            code === 'expired_token' || code === 'access_denied') {
          return { status: code };
        }
      }
      throw this.normalizeError(error);
    }
  }
}

export default AuthSomeAdapter;

/**
 * Auth provider interface and request/response types
 */

import type {
  User,
  Session,
  SessionData,
  AuthError,
  OAuthProvider,
  TwoFactorMethod,
  PasskeyCredential,
} from './auth';

/**
 * Sign in request
 */
export interface SignInRequest {
  email?: string;
  username?: string;
  phone?: string;
  password?: string;
  remember?: boolean;
}

/**
 * Sign up request
 */
export interface SignUpRequest {
  email?: string;
  username?: string;
  phone?: string;
  password: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown; // Allow dynamic fields
}

/**
 * OAuth sign in request
 */
export interface OAuthSignInRequest {
  provider: OAuthProvider;
  redirectUri?: string;
  state?: string;
  scope?: string[];
}

/**
 * OAuth callback request
 */
export interface OAuthCallbackRequest {
  provider: OAuthProvider;
  code: string;
  state?: string;
}

/**
 * Magic link request
 */
export interface MagicLinkRequest {
  email: string;
  redirectUri?: string;
}

/**
 * Magic link verify request
 */
export interface MagicLinkVerifyRequest {
  token: string;
}

/**
 * Phone auth request
 */
export interface PhoneAuthRequest {
  phone: string;
}

/**
 * Phone verify request
 */
export interface PhoneVerifyRequest {
  phone: string;
  code: string;
}

/**
 * 2FA setup request
 */
export interface TwoFactorSetupRequest {
  method: TwoFactorMethod;
  phone?: string; // For SMS
  email?: string; // For email
}

/**
 * 2FA setup response
 */
export interface TwoFactorSetupResponse {
  method: TwoFactorMethod;
  secret?: string; // For TOTP
  qrCode?: string; // For TOTP
  backupCodes?: string[]; // Backup codes
}

/**
 * 2FA verify request
 */
export interface TwoFactorVerifyRequest {
  code: string;
  method?: TwoFactorMethod;
  remember?: boolean;
}

/**
 * Passkey registration request
 */
export interface PasskeyRegisterRequest {
  name?: string;
}

/**
 * Passkey authentication request
 */
export interface PasskeyAuthRequest {
  credentialId?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset confirm request
 */
export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
}

/**
 * Password change request
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update user request
 */
export interface UpdateUserRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Field validation rules for dynamic signup fields
 */
export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string; // Regex pattern as string (will be sent from API)
  errorMessage?: string;
}

/**
 * Field type for dynamic signup forms
 */
export type FieldType = 'text' | 'email' | 'tel' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date' | 'url' | 'password' | 'group';

/**
 * Dynamic field definition for signup forms
 */
export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  defaultValue?: string | number | boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: FieldValidation;
  /**
   * Nested fields for 'group' type
   * Groups render multiple fields in a horizontal row with a gap
   */
  fields?: FieldDefinition[];
  /**
   * Gap between fields in a group (CSS gap value)
   * @default '1rem'
   */
  gap?: string;
  /**
   * Order priority for field positioning
   * Lower numbers appear first. Fields without order are sorted after ordered fields.
   * @default undefined
   */
  order?: number;
}

/**
 * Response containing dynamic signup fields
 */
export interface SignupFieldsResponse {
  fields: FieldDefinition[];
}

/**
 * Auth response
 */
export interface AuthResponse {
  user: User;
  session: Session;
  requiresTwoFactor?: boolean;
  twoFactorMethods?: TwoFactorMethod[];
}

/**
 * Provider configuration
 */
export interface ProviderConfig {
  apiUrl?: string;
  apiKey?: string;
  [key: string]: unknown;
}

/**
 * Generic request context (framework-agnostic)
 * Used to pass request information to adapters in edge runtime environments
 */
export interface RequestContext {
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  url?: string;
  method?: string;
  [key: string]: unknown;
}

/**
 * Cookie data to be set by the framework
 * Adapters return this data; the framework is responsible for setting cookies
 */
export interface CookieData {
  name: string;
  value: string;
  options?: {
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    maxAge?: number;
    expires?: Date;
  };
}

/**
 * Email verification request
 */
export interface SendVerificationEmailRequest {
  email: string;
}

/**
 * Verify email request
 */
export interface VerifyEmailRequest {
  token: string;
  code?: string;
}

/**
 * Resend verification email request
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * MFA Factor representation
 */
export interface MFAFactor {
  id: string;
  type: string;
  name: string;
  status: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Enroll MFA factor request
 */
export interface EnrollMFAFactorRequest {
  type: string;
  name: string;
  metadata?: Record<string, unknown>;
}

/**
 * Verify MFA factor request
 */
export interface VerifyMFAFactorRequest {
  factorId: string;
  code: string;
}

/**
 * MFA challenge request
 */
export interface MFAChallengeRequest {
  userId?: string;
  factorTypes?: string[];
}

/**
 * MFA challenge response
 */
export interface MFAChallengeResponse {
  challengeId: string;
  availableFactors: MFAFactor[];
  expiresAt: Date;
}

/**
 * Device information
 */
export interface Device {
  id: string;
  userId: string;
  name?: string;
  type?: string;
  lastUsedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Extended session information with device and location
 */
export interface SessionInfo extends Session {
  device?: Device;
  location?: string;
}

/**
 * Options for listing sessions with filtering and pagination
 */
export interface ListSessionsOptions {
  /** Filter by active sessions only */
  active?: boolean;
  /** Filter by IP address */
  ipAddress?: string;
  /** Filter by user agent */
  userAgent?: string;
  /** Filter sessions created after this date (ISO string or Date) */
  createdFrom?: string | Date;
  /** Filter sessions created before this date (ISO string or Date) */
  createdTo?: string | Date;
  /** Field to sort by (e.g., 'createdAt', 'lastUsedAt') */
  sortBy?: string;
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  /** Maximum number of sessions to return (default: 50) */
  limit?: number;
  /** Number of sessions to skip for pagination (default: 0) */
  offset?: number;
}

/**
 * Paginated response for session listing
 */
export interface ListSessionsResponse {
  /** Array of session information */
  sessions: SessionInfo[];
  /** Total number of sessions matching the filter */
  total: number;
  /** Current page number */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Number of sessions per page */
  limit: number;
}

/**
 * Auth provider interface
 * 
 * This interface defines the contract that all auth providers must implement.
 * Providers can be for different backends like AuthSome, Clerk, Supabase, etc.
 */
export interface AuthProvider {
  /**
   * Provider name/identifier
   */
  readonly name: string;

  /**
   * Initialize the provider
   */
  initialize(config: ProviderConfig): Promise<void>;

  /**
   * Sign in with email/username/phone and password
   */
  signIn(request: SignInRequest): Promise<AuthResponse>;

  /**
   * Sign up with email/username/phone and password
   */
  signUp(request: SignUpRequest): Promise<AuthResponse>;

  /**
   * Sign out
   */
  signOut(): Promise<void>;

  /**
   * Get current user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Get current session
   */
  getCurrentSession(): Promise<Session | null>;

  /**
   * Get current session data (user + session combined)
   * More efficient than calling getCurrentUser() and getCurrentSession() separately
   */
  getCurrentSessionData(): Promise<SessionData | null>;

  /**
   * Refresh session
   */
  refreshSession(): Promise<Session>;

  /**
   * Update user profile
   */
  updateUser(request: UpdateUserRequest): Promise<User>;

  /**
   * Change password
   */
  changePassword(request: PasswordChangeRequest): Promise<void>;

  /**
   * Request password reset
   */
  requestPasswordReset(request: PasswordResetRequest): Promise<void>;

  /**
   * Confirm password reset
   */
  confirmPasswordReset(request: PasswordResetConfirmRequest): Promise<void>;

  // OAuth methods
  /**
   * Initiate OAuth sign in
   */
  oauthSignIn(request: OAuthSignInRequest): Promise<string>; // Returns auth URL

  /**
   * Handle OAuth callback
   */
  oauthCallback(request: OAuthCallbackRequest): Promise<AuthResponse>;

  /**
   * Get available OAuth providers
   */
  getOAuthProviders(): Promise<OAuthProvider[]>;

  // Magic link methods
  /**
   * Send magic link
   */
  sendMagicLink(request: MagicLinkRequest): Promise<void>;

  /**
   * Verify magic link
   */
  verifyMagicLink(request: MagicLinkVerifyRequest): Promise<AuthResponse>;

  // Phone auth methods
  /**
   * Send phone verification code
   */
  sendPhoneCode(request: PhoneAuthRequest): Promise<void>;

  /**
   * Verify phone code
   */
  verifyPhoneCode(request: PhoneVerifyRequest): Promise<AuthResponse>;

  // 2FA methods
  /**
   * Setup 2FA
   */
  setupTwoFactor(request: TwoFactorSetupRequest): Promise<TwoFactorSetupResponse>;

  /**
   * Verify 2FA
   */
  verifyTwoFactor(request: TwoFactorVerifyRequest): Promise<AuthResponse>;

  /**
   * Disable 2FA
   */
  disableTwoFactor(): Promise<void>;

  /**
   * Get 2FA status
   */
  getTwoFactorStatus(): Promise<TwoFactorMethod[]>;

  // Passkey methods
  /**
   * Register passkey
   */
  registerPasskey(request: PasskeyRegisterRequest): Promise<PasskeyCredential>;

  /**
   * Authenticate with passkey
   */
  authenticatePasskey(request: PasskeyAuthRequest): Promise<AuthResponse>;

  /**
   * List passkeys
   */
  listPasskeys(): Promise<PasskeyCredential[]>;

  /**
   * Delete passkey
   */
  deletePasskey(credentialId: string): Promise<void>;

  // Error handling
  /**
   * Normalize provider-specific errors to AuthError
   */
  normalizeError(error: unknown): AuthError;

  // Optional organization methods (adapter-specific)
  /**
   * Get all organizations the user belongs to
   * Optional - only available if adapter supports organizations
   */
  getOrganizations?(): Promise<import('./auth').Organization[]>;

  /**
   * Get the currently active organization
   * Optional - only available if adapter supports organizations
   */
  getActiveOrganization?(): Promise<import('./auth').Organization | null>;

  /**
   * Set the active organization
   * Optional - only available if adapter supports organizations
   */
  setActiveOrganization?(organizationId: string): Promise<void>;

  /**
   * Get organization memberships with roles and permissions
   * Optional - only available if adapter supports organizations
   */
  getOrganizationMemberships?(): Promise<import('./auth').OrganizationMembership[]>;

  /**
   * Get dynamic signup fields from the backend
   * Optional - only available if adapter supports dynamic signup fields
   */
  getSignupFields?(): Promise<FieldDefinition[]>;

  // Edge runtime context methods (optional)
  /**
   * Set request context for subsequent adapter calls
   * Optional - only needed for edge runtime environments
   */
  setContext?(context: RequestContext): void;

  /**
   * Get cookies that should be set by the framework
   * Optional - only needed for edge runtime environments
   */
  getCookies?(): CookieData[];

  /**
   * Clear request context
   * Optional - only needed for edge runtime environments
   */
  clearContext?(): void;

  // Email Verification methods (optional)
  /**
   * Send verification email to user
   * Optional - only available if adapter supports email verification
   */
  sendVerificationEmail?(request: SendVerificationEmailRequest): Promise<void>;

  /**
   * Verify email with token/code
   * Optional - only available if adapter supports email verification
   */
  verifyEmail?(request: VerifyEmailRequest): Promise<void>;

  /**
   * Resend verification email
   * Optional - only available if adapter supports email verification
   */
  resendVerificationEmail?(request: ResendVerificationRequest): Promise<void>;

  // Advanced MFA methods (optional)
  /**
   * Enroll a new MFA factor
   * Optional - only available if adapter supports advanced MFA
   */
  enrollMFAFactor?(request: EnrollMFAFactorRequest): Promise<MFAFactor>;

  /**
   * List all enrolled MFA factors
   * Optional - only available if adapter supports advanced MFA
   */
  listMFAFactors?(): Promise<MFAFactor[]>;

  /**
   * Get specific MFA factor details
   * Optional - only available if adapter supports advanced MFA
   */
  getMFAFactor?(factorId: string): Promise<MFAFactor>;

  /**
   * Delete an MFA factor
   * Optional - only available if adapter supports advanced MFA
   */
  deleteMFAFactor?(factorId: string): Promise<void>;

  /**
   * Verify an MFA factor
   * Optional - only available if adapter supports advanced MFA
   */
  verifyMFAFactor?(request: VerifyMFAFactorRequest): Promise<void>;

  /**
   * Initiate MFA challenge
   * Optional - only available if adapter supports advanced MFA
   */
  initiateMFAChallenge?(request: MFAChallengeRequest): Promise<MFAChallengeResponse>;

  /**
   * Get MFA status for current user
   * Optional - only available if adapter supports advanced MFA
   */
  getMFAStatus?(): Promise<{ enabled: boolean; factors: MFAFactor[] }>;

  // Device Management methods (optional)
  /**
   * List all devices for current user
   * Optional - only available if adapter supports device management
   */
  listDevices?(): Promise<Device[]>;

  /**
   * Revoke a specific device
   * Optional - only available if adapter supports device management
   */
  revokeDevice?(deviceId: string): Promise<void>;

  /**
   * Trust a device for MFA
   * Optional - only available if adapter supports device management
   */
  trustDevice?(deviceId: string, name?: string): Promise<void>;

  /**
   * List all trusted devices
   * Optional - only available if adapter supports device management
   */
  listTrustedDevices?(): Promise<Device[]>;

  /**
   * Revoke trust from a device
   * Optional - only available if adapter supports device management
   */
  revokeTrustedDevice?(deviceId: string): Promise<void>;

  // Session Management methods (optional)
  /**
   * List sessions with optional filtering and pagination
   * Optional - only available if adapter supports session management
   * 
   * @param options - Optional filter and pagination parameters
   * @returns Paginated session list with metadata
   */
  listSessions?(options?: ListSessionsOptions): Promise<ListSessionsResponse>;

  /**
   * Revoke a specific session
   * Optional - only available if adapter supports session management
   */
  revokeSession?(sessionId: string): Promise<void>;

  /**
   * Revoke all sessions except current
   * Optional - only available if adapter supports session management
   */
  revokeAllSessions?(): Promise<void>;

  // Device Flow methods (RFC 8628 - OAuth 2.0 Device Authorization Grant)
  /**
   * Initiate device authorization flow
   * Used by CLI/device applications to start the authorization process
   * Returns device code, user code, and verification URI
   */
  initiateDeviceFlow?(request: import('./auth').DeviceFlowInitiateRequest): Promise<import('./auth').DeviceFlowInitiateResponse>;

  /**
   * Verify a user-entered device code
   * Called by web UI when user enters the code shown on their device
   */
  verifyDeviceCode?(request: import('./auth').DeviceCodeVerifyRequest): Promise<import('./auth').DeviceCodeVerifyResponse>;

  /**
   * Authorize or deny the device request
   * Called when user approves or denies the authorization
   */
  authorizeDevice?(request: import('./auth').DeviceAuthorizeRequest): Promise<void>;

  /**
   * Poll for device token (used by CLI/device)
   * Returns auth response when authorized, or status when still pending
   */
  pollDeviceToken?(request: import('./auth').DeviceTokenPollRequest): Promise<AuthResponse | import('./auth').DeviceTokenPollResponse>;
}


/**
 * Core authentication types and interfaces
 */

/**
 * Authentication state enum
 */
export enum AuthState {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  LOADING = 'loading',
  ERROR = 'error',
}

/**
 * User profile interface
 */
export interface User {
  id: string;
  email?: string;
  username?: string;
  phone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Organization fields
  organizationId?: string;
  organizationRole?: string;
  organizationMemberships?: OrganizationMembership[];
}

/**
 * Session interface
 */
export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt?: Date;
  createdAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Session data with user and session combined
 * Used for efficient retrieval of both user and session in one call
 */
export interface SessionData {
  user: User;
  session: Session;
  expiresAt: number;
}

/**
 * Auth error types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  USER_NOT_FOUND = 'user_not_found',
  USER_ALREADY_EXISTS = 'user_already_exists',
  INVALID_TOKEN = 'invalid_token',
  TOKEN_EXPIRED = 'token_expired',
  NETWORK_ERROR = 'network_error',
  VALIDATION_ERROR = 'validation_error',
  MFA_REQUIRED = 'mfa_required',
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  PHONE_NOT_VERIFIED = 'phone_not_verified',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * Auth error class
 * 
 * Extends Error to provide proper error handling with auth-specific context
 */
export class AuthError extends Error {
  public readonly type: AuthErrorType;
  public readonly details?: Record<string, unknown>;
  public readonly code?: string | number;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    type: AuthErrorType = AuthErrorType.UNKNOWN_ERROR,
    options?: {
      details?: Record<string, unknown>;
      code?: string | number;
      originalError?: unknown;
    }
  ) {
    super(message);
    this.name = 'AuthError';
    this.type = type;
    this.details = options?.details;
    this.code = options?.code;
    this.originalError = options?.originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
  }
}

/**
 * Auth context state
 */
export interface AuthContext {
  state: AuthState;
  user: User | null;
  session: Session | null;
  error: AuthError | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * OAuth provider types
 */
export enum OAuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  MICROSOFT = 'microsoft',
  APPLE = 'apple',
  LINKEDIN = 'linkedin',
  DISCORD = 'discord',
}

/**
 * OAuth configuration
 */
export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  redirectUri: string;
  scope?: string[];
  state?: string;
}

/**
 * 2FA method types
 */
export enum TwoFactorMethod {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  BACKUP_CODE = 'backup_code',
}

/**
 * 2FA configuration
 */
export interface TwoFactorConfig {
  method: TwoFactorMethod;
  enabled: boolean;
  verified?: boolean;
}

/**
 * Passkey/WebAuthn types
 */
export interface PasskeyCredential {
  id: string;
  name?: string;
  createdAt?: Date;
  lastUsedAt?: Date;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Organization interface
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  createdAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Organization membership interface
 */
export interface OrganizationMembership {
  organization: Organization;
  role: 'owner' | 'admin' | 'member';
  permissions?: string[];
}

/**
 * Device Flow types (RFC 8628 - OAuth 2.0 Device Authorization Grant)
 */

/**
 * Request to initiate device flow
 * Used by CLI/device applications to start the authorization process
 */
export interface DeviceFlowInitiateRequest {
  clientId: string;
  scope?: string;
}

/**
 * Response from device flow initiation
 * Contains codes and URIs needed for user authorization
 */
export interface DeviceFlowInitiateResponse {
  /** The device verification code (long, secret code for polling) */
  deviceCode: string;
  /** The user-facing code to enter in browser (short, easy-to-type) */
  userCode: string;
  /** The URL to visit for verification */
  verificationUri: string;
  /** Optional complete URL with user_code pre-filled */
  verificationUriComplete?: string;
  /** Lifetime of device_code and user_code in seconds */
  expiresIn: number;
  /** Minimum polling interval in seconds */
  interval: number;
}

/**
 * Request to verify a user-entered device code
 * Used by the web UI when user enters their code
 */
export interface DeviceCodeVerifyRequest {
  userCode: string;
}

/**
 * Response from device code verification
 * Contains information about the pending authorization
 */
export interface DeviceCodeVerifyResponse {
  /** Whether the code is valid */
  valid: boolean;
  /** Client application name requesting access */
  clientName?: string;
  /** Scopes being requested */
  scopes?: string[];
  /** Time remaining before code expires */
  expiresIn?: number;
}

/**
 * Request to authorize/deny a device
 * Used when user approves or denies the authorization request
 */
export interface DeviceAuthorizeRequest {
  userCode: string;
  action: 'approve' | 'deny';
}

/**
 * Request to poll for device token
 * Used by CLI/device to check if user has authorized
 */
export interface DeviceTokenPollRequest {
  deviceCode: string;
  clientId: string;
}

/**
 * Status returned when polling is not yet complete
 */
export type DeviceTokenPollStatus = 
  | 'authorization_pending'  // User hasn't authorized yet
  | 'slow_down'              // Polling too frequently
  | 'expired_token'          // Device code expired
  | 'access_denied';         // User denied authorization

/**
 * Response from device token polling
 * Either contains the auth response or a status indicator
 */
export interface DeviceTokenPollResponse {
  status: DeviceTokenPollStatus;
}

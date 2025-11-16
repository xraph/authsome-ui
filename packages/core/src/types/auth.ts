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


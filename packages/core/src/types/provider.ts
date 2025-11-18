/**
 * Auth provider interface and request/response types
 */

import type {
  User,
  Session,
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
 * Dynamic field definition for signup forms
 */
export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'checkbox' | 'textarea' | 'date' | 'url' | 'password';
  placeholder?: string;
  helperText?: string;
  defaultValue?: string | number | boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: FieldValidation;
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
}


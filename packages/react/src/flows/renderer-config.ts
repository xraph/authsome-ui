/**
 * Configuration for built-in renderers
 */

import type { OAuthProvider } from '@authsome/ui-core';

/**
 * Auth method configuration
 */
export interface AuthMethodConfig {
  /**
   * Enable email/password authentication
   * @default true
   */
  emailPassword?: boolean;

  /**
   * Enable OAuth/social login
   * @default false
   */
  oauth?: boolean | {
    /**
     * OAuth providers to show
     */
    providers: OAuthProvider[];
    /**
     * Show as buttons or provider selector
     */
    display?: 'buttons' | 'selector';
  };

  /**
   * Enable magic link authentication
   * @default false
   */
  magicLink?: boolean;

  /**
   * Enable phone authentication
   * @default false
   */
  phone?: boolean;

  /**
   * Enable passkey/WebAuthn authentication
   * @default false
   */
  passkey?: boolean;

  /**
   * Enable username authentication
   * @default false
   */
  username?: boolean;
}

/**
 * Custom field types
 */
export type FieldType = 'text' | 'email' | 'password' | 'tel' | 'url' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';

/**
 * Custom field definition
 */
export interface CustomField {
  /**
   * Field name (will be the key in form data)
   */
  name: string;

  /**
   * Field label
   */
  label: string;

  /**
   * Field type
   * @default 'text'
   */
  type?: FieldType;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Is this field required?
   * @default false
   */
  required?: boolean;

  /**
   * Validation pattern (regex)
   */
  pattern?: RegExp;

  /**
   * Error message for validation failure
   */
  errorMessage?: string;

  /**
   * Helper text shown below the field
   */
  helperText?: string;

  /**
   * Options for select fields
   */
  options?: { value: string; label: string }[];

  /**
   * Default value
   */
  defaultValue?: string | boolean | number;

  /**
   * Minimum length for text fields
   */
  minLength?: number;

  /**
   * Maximum length for text fields
   */
  maxLength?: number;

  /**
   * Minimum value for number fields
   */
  min?: number;

  /**
   * Maximum value for number fields
   */
  max?: number;
}

/**
 * Sign-up configuration
 */
export interface SignUpConfig {
  /**
   * Additional fields to collect during signup
   */
  customFields?: CustomField[];

  /**
   * Require email verification after signup
   * @default false
   */
  requireEmailVerification?: boolean;

  /**
   * Show terms and conditions checkbox
   * @default false
   */
  showTermsCheckbox?: boolean;

  /**
   * Terms and conditions text/link
   */
  termsText?: string;

  /**
   * Terms and conditions URL
   */
  termsUrl?: string;

  /**
   * Custom validation function for signup data
   */
  validate?: (data: Record<string, any>) => string | null;
}

/**
 * Sign-in configuration
 */
export interface SignInConfig {
  /**
   * Show "Remember Me" checkbox
   * @default true
   */
  showRememberMe?: boolean;

  /**
   * Show "Forgot Password" link
   * @default true
   */
  showForgotPassword?: boolean;

  /**
   * Forgot password URL
   */
  forgotPasswordUrl?: string;
}

/**
 * Complete renderer configuration
 */
export interface RendererConfig {
  /**
   * Which auth methods to enable
   */
  authMethods?: AuthMethodConfig;

  /**
   * Sign-up specific configuration
   */
  signUp?: SignUpConfig;

  /**
   * Sign-in specific configuration
   */
  signIn?: SignInConfig;

  /**
   * Show social login buttons at the top
   * @default true (if OAuth is enabled)
   */
  socialFirst?: boolean;

  /**
   * Custom labels and text
   */
  labels?: {
    signIn?: string;
    signUp?: string;
    or?: string;
    continueWith?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Default configuration
 */
export const defaultRendererConfig: RendererConfig = {
  authMethods: {
    emailPassword: true,
    oauth: false,
    magicLink: false,
    phone: false,
    passkey: false,
    username: false,
  },
  signIn: {
    showRememberMe: true,
    showForgotPassword: true,
  },
  signUp: {
    requireEmailVerification: false,
    showTermsCheckbox: false,
  },
  socialFirst: true,
  labels: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    or: 'Or continue with',
    continueWith: 'Continue with',
  },
};

/**
 * Merge user config with defaults
 */
export function mergeRendererConfig(userConfig?: RendererConfig): RendererConfig {
  if (!userConfig) return defaultRendererConfig;

  return {
    authMethods: {
      ...defaultRendererConfig.authMethods,
      ...userConfig.authMethods,
    },
    signIn: {
      ...defaultRendererConfig.signIn,
      ...userConfig.signIn,
    },
    signUp: {
      ...defaultRendererConfig.signUp,
      ...userConfig.signUp,
    },
    socialFirst: userConfig.socialFirst ?? defaultRendererConfig.socialFirst,
    labels: {
      ...defaultRendererConfig.labels,
      ...userConfig.labels,
    },
  };
}


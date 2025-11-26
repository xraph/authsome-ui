/**
 * Configuration for built-in renderers
 */

import type { OAuthProvider, AuthLocale, DeepPartial, User, Session, FlowState } from '@authsome/ui-core';

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
    /**
     * Layout for OAuth buttons
     * - 'default': Full width buttons with icons and text (vertical list)
     * - 'horizontal': Icon-only buttons arranged horizontally
     * @default 'default'
     */
    layout?: 'default' | 'horizontal';
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

  /**
   * Enable password reset flow
   * @default false
   */
  passwordReset?: boolean;

  /**
   * Enable email verification
   * @default false
   */
  emailVerification?: boolean | {
    /**
     * Verification method: code, link, or both
     * @default 'both'
     */
    method?: 'code' | 'link' | 'both';
  };
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
   * Additional fields to collect during signup (client-side defined)
   */
  customFields?: CustomField[];

  /**
   * Whether to fetch and use dynamic fields from backend
   * @default true
   */
  useDynamicFields?: boolean;

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

  /**
   * Show link to sign in page
   * @default true
   */
  showSignInLink?: boolean;

  /**
   * URL for sign in page
   * @default '/auth/signin'
   */
  signInUrl?: string;
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

  /**
   * Text for the continue button in dynamic flow
   * @default "Continue"
   */
  continueButtonText?: string;

  /**
   * Enable dynamic flow (Microsoft/Google style) when multiple auth methods are available
   * Shows email first, then method selection
   * @default true when multiple email-based methods are enabled
   */
  enableDynamicFlow?: boolean;

  /**
   * Show link to sign up page
   * @default true
   */
  showSignUpLink?: boolean;

  /**
   * URL for sign up page
   * @default '/auth/signup'
   */
  signUpUrl?: string;
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
   * @deprecated Use `locale` instead for full i18n support
   */
  labels?: {
    signIn?: string;
    signUp?: string;
    or?: string;
    continueWith?: string;
    [key: string]: string | undefined;
  };

  /**
   * Locale configuration for internationalization
   * Provides translations for all text in the auth UI
   * 
   * @example
   * ```typescript
   * locale: {
   *   auth: {
   *     signIn: 'Iniciar sesión',
   *     signUp: 'Registrarse',
   *   },
   *   validation: {
   *     emailRequired: 'El correo electrónico es obligatorio',
   *   }
   * }
   * ```
   */
  locale?: DeepPartial<AuthLocale>;

  /**
   * Redirect configuration for post-authentication navigation
   * 
   * The redirect only happens when the flow reaches the terminal SUCCESS step.
   * Intermediate steps (like email verification) are handled by the flow engine.
   */
  redirect?: RedirectConfig;
}

/**
 * Redirect configuration
 */
export interface RedirectConfig {
  /**
   * Default URL to redirect to after successful authentication
   * This is used when no callbackUrl is provided in the URL params
   * @default '/'
   */
  defaultUrl?: string;

  /**
   * Whether to automatically redirect when the flow reaches SUCCESS
   * Set to false if you want to show a success screen instead
   * @default true
   */
  autoRedirect?: boolean;

  /**
   * Delay in milliseconds before redirecting (to show success message)
   * Only applies when autoRedirect is true
   * @default 0 (immediate redirect)
   */
  redirectDelay?: number;

  /**
   * Custom redirect handler
   * If provided, this will be called instead of the default redirect behavior
   * Useful for custom navigation (e.g., using Next.js router)
   * 
   * @param url - The URL to redirect to (callbackUrl or defaultUrl)
   * @param user - The authenticated user
   * @param session - The user's session
   * @param flowState - The current flow state (contains metadata like callbackUrl)
   */
  onRedirect?: (url: string, user: User, session: Session, flowState?: FlowState) => void;
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
    passwordReset: false,
    emailVerification: false,
  },
  signIn: {
    showRememberMe: true,
    showForgotPassword: true,
    showSignUpLink: true,
    signUpUrl: '/auth/signup',
  },
  signUp: {
    requireEmailVerification: false,
    showTermsCheckbox: false,
    useDynamicFields: true,
    showSignInLink: true,
    signInUrl: '/auth/signin',
  },
  socialFirst: true,
  labels: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    or: 'Or continue with',
    continueWith: 'Continue with {provider}',
  },
  redirect: {
    defaultUrl: '/',
    autoRedirect: true,
    redirectDelay: 0,
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
    locale: userConfig.locale,
    redirect: {
      ...defaultRendererConfig.redirect,
      ...userConfig.redirect,
    },
  };
}


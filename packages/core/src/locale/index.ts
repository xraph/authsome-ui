/**
 * Internationalization (i18n) types and interfaces
 */

/**
 * Complete locale interface for all auth-related text
 */
export interface AuthLocale {
  // Common UI elements
  common: {
    loading: string;
    submit: string;
    cancel: string;
    continue: string;
    back: string;
    or: string;
    optional: string;
  };
  
  // Auth methods and fields
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    phone: string;
    rememberMe: string;
    forgotPassword: string;
    continueWith: string; // "Continue with {provider}"
    orContinueWith: string;
  };
  
  // OAuth providers
  oauth: {
    google: string;
    github: string;
    microsoft: string;
    facebook: string;
    apple: string;
    discord: string;
    twitter: string;
    linkedin: string;
    chooseProvider: string;
    signInPreferred: string;
  };
  
  // Magic Link authentication
  magicLink: {
    sendLink: string;
    checkEmail: string;
    linkSent: string;
    enterEmail: string;
  };
  
  // Phone authentication
  phone: {
    enterPhone: string;
    sendCode: string;
    enterCode: string;
    verifyPhone: string;
    codeLabel: string;
  };
  
  // Multi-factor authentication
  mfa: {
    required: string;
    selectMethod: string;
    verify: string;
    enterCode: string;
    sms: string;
    authenticator: string;
    email: string;
  };
  
  // Passkey/WebAuthn
  passkey: {
    signInWith: string;
    register: string;
    usePasskey: string;
  };
  
  // Device Flow (RFC 8628)
  deviceFlow: {
    title: string;
    subtitle: string;
    enterCode: string;
    enterCodeDescription: string;
    codeLabel: string;
    codePlaceholder: string;
    codeHint: string;
    verify: string;
    verifyCode: string;
    invalidCode: string;
    noCode: string;
    getCodeHelp: string;
    authorizationTitle: string;
    authorizationSubtitle: string;
    authorizeTitle: string;
    authorizeDescription: string;
    requestingAccess: string;
    codeConfirm: string;
    requestedPermissions: string;
    securityWarning: string;
    scopes: string;
    approve: string;
    deny: string;
    authorizedTitle: string;
    authorizedMessage: string;
    authorizedDescription: string;
    authorizedHint: string;
    returnToCli: string;
    deniedTitle: string;
    deniedMessage: string;
    deniedDescription: string;
    deniedHint: string;
  };
  
  // Sign Up specific
  signUp: {
    title: string;
    subtitle: string;
    haveAccount: string;
    signInLink: string;
    agreeToTerms: string; // "I agree to the {terms}"
    terms: string; // "terms and conditions"
  };
  
  // Sign In specific
  signIn: {
    title: string;
    subtitle: string;
    noAccount: string;
    signUpLink: string;
    enterEmail: string;
  };
  
  // Validation error messages
  validation: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordTooShort: string; // "Password must be at least {min} characters"
    passwordRequireUppercase: string;
    passwordRequireLowercase: string;
    passwordRequireNumber: string;
    passwordRequireSpecial: string;
    passwordMismatch: string;
    usernameRequired: string;
    usernameInvalid: string;
    phoneRequired: string;
    phoneInvalid: string;
    codeRequired: string;
    codeInvalid: string;
    fieldRequired: string; // "{field} is required"
    termsRequired: string;
  };
  
  // Auth error messages
  errors: {
    invalidCredentials: string;
    userNotFound: string;
    userExists: string;
    invalidToken: string;
    tokenExpired: string;
    networkError: string;
    mfaRequired: string;
    emailNotVerified: string;
    phoneNotVerified: string;
    rateLimitExceeded: string;
    unknownError: string;
    generic: string; // "Something went wrong"
  };
  
  // Success messages
  success: {
    signedIn: string;
    signedUp: string;
    signedOut: string;
    linkSent: string;
    codeSent: string;
    verified: string;
    welcome: string; // "Welcome, {name}!"
  };
  
  // Input placeholders
  placeholders: {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    phone: string;
    code: string;
    fullName: string;
  };
}

/**
 * Deep partial type for locale overrides
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};


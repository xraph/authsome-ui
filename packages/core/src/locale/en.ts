/**
 * English (US) locale - Default translations
 */

import type { AuthLocale } from './index';

export const enLocale: AuthLocale = {
  common: {
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    continue: 'Continue',
    back: 'Back',
    or: 'or',
    optional: 'optional',
  },
  
  auth: {
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    username: 'Username',
    phone: 'Phone',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    continueWith: 'Continue with {provider}',
    orContinueWith: 'Or continue with',
  },
  
  oauth: {
    google: 'Google',
    github: 'GitHub',
    microsoft: 'Microsoft',
    facebook: 'Facebook',
    apple: 'Apple',
    discord: 'Discord',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    chooseProvider: 'Choose Your Provider',
    signInPreferred: 'Sign in with your preferred account',
  },
  
  magicLink: {
    sendLink: 'Send magic link',
    checkEmail: 'Check your email',
    linkSent: 'Magic link sent! Check your email to continue.',
    enterEmail: 'Enter your email to receive a magic link',
  },
  
  phone: {
    enterPhone: 'Enter your phone number',
    sendCode: 'Send code',
    enterCode: 'Enter verification code',
    verifyPhone: 'Verify phone number',
    codeLabel: 'Verification code',
  },
  
  mfa: {
    required: 'Two-factor authentication required',
    selectMethod: 'Select verification method',
    verify: 'Verify',
    enterCode: 'Enter verification code',
    sms: 'SMS',
    authenticator: 'Authenticator app',
    email: 'Email',
  },
  
  passkey: {
    signInWith: 'Sign in with passkey',
    register: 'Register passkey',
    usePasskey: 'Use passkey',
  },
  
  deviceFlow: {
    title: 'Authorize Device',
    subtitle: 'Enter the code displayed on your device',
    enterCode: 'Authorize Device',
    enterCodeDescription: 'Enter the code displayed on your device or CLI',
    codeLabel: 'Device Code',
    codePlaceholder: 'XXXX-XXXX',
    codeHint: 'Enter the 8-character code shown on your device',
    verify: 'Verify Code',
    verifyCode: 'Verify Code',
    invalidCode: 'Invalid code. Please check and try again.',
    noCode: "Don't have a code?",
    getCodeHelp: 'Get help',
    authorizationTitle: 'Authorize Application',
    authorizationSubtitle: 'An application is requesting access to your account',
    authorizeTitle: 'Authorize Device',
    authorizeDescription: 'An application is requesting access to your account',
    requestingAccess: 'is requesting access to:',
    codeConfirm: 'Confirm this is your code:',
    requestedPermissions: 'Requested permissions:',
    securityWarning: 'Only approve this request if you initiated it',
    scopes: 'Requested permissions',
    approve: 'Approve',
    deny: 'Deny',
    authorizedTitle: 'Device Authorized',
    authorizedMessage: 'You can now return to your device to continue',
    authorizedDescription: 'Your device has been successfully authorized',
    authorizedHint: 'You can close this window and return to your CLI or device',
    returnToCli: 'Return to CLI',
    deniedTitle: 'Access Denied',
    deniedMessage: 'You have denied access to this device',
    deniedDescription: 'The device authorization request has been denied',
    deniedHint: 'You can close this window',
  },
  
  signUp: {
    title: 'Create Account',
    subtitle: 'Get started with your account',
    haveAccount: 'Already have an account?',
    signInLink: 'Sign in',
    agreeToTerms: 'I agree to the {terms}',
    terms: 'terms and conditions',
  },
  
  signIn: {
    title: 'Sign In',
    subtitle: 'Enter your email to continue',
    noAccount: "Don't have an account?",
    signUpLink: 'Sign up',
    enterEmail: 'Enter your email to continue',
  },
  
  validation: {
    emailRequired: 'Email is required',
    emailInvalid: 'Invalid email address',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least {min} characters',
    passwordRequireUppercase: 'Password must contain an uppercase letter',
    passwordRequireLowercase: 'Password must contain a lowercase letter',
    passwordRequireNumber: 'Password must contain a number',
    passwordRequireSpecial: 'Password must contain a special character',
    passwordMismatch: 'Passwords do not match',
    usernameRequired: 'Username is required',
    usernameInvalid: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens',
    phoneRequired: 'Phone number is required',
    phoneInvalid: 'Invalid phone number',
    codeRequired: 'Verification code is required',
    codeInvalid: 'Invalid verification code',
    fieldRequired: '{field} is required',
    termsRequired: 'You must agree to the terms and conditions',
  },
  
  errors: {
    invalidCredentials: 'Invalid email or password',
    userNotFound: 'User not found',
    userExists: 'User already exists',
    invalidToken: 'Invalid or expired token',
    tokenExpired: 'Token has expired',
    networkError: 'Network error. Please try again.',
    mfaRequired: 'Two-factor authentication required',
    emailNotVerified: 'Email not verified',
    phoneNotVerified: 'Phone number not verified',
    rateLimitExceeded: 'Too many attempts. Please try again later.',
    unknownError: 'An unknown error occurred',
    generic: 'Something went wrong. Please try again.',
  },
  
  success: {
    signedIn: 'Successfully signed in',
    signedUp: 'Account created successfully',
    signedOut: 'Successfully signed out',
    linkSent: 'Link sent successfully',
    codeSent: 'Verification code sent',
    verified: 'Successfully verified',
    welcome: 'Welcome, {name}!',
  },
  
  placeholders: {
    email: 'john@example.com',
    password: 'Enter your password',
    confirmPassword: 'Confirm your password',
    username: 'johndoe',
    phone: '+1234567890',
    code: '123456',
    fullName: 'John Doe',
  },
};


/**
 * Authentication flow types and state machine
 */

import type { User, Session, AuthError, OAuthProvider, TwoFactorMethod } from '../types';

/**
 * Available authentication flow steps
 */
export enum FlowStep {
  // Initial entry points
  SIGN_IN = 'sign_in',
  SIGN_UP = 'sign_up',
  
  // Email/Password flows
  EMAIL_PASSWORD_SIGN_IN = 'email_password_sign_in',
  EMAIL_PASSWORD_SIGN_UP = 'email_password_sign_up',
  
  // OAuth flows
  OAUTH_SELECT = 'oauth_select',
  OAUTH_CALLBACK = 'oauth_callback',
  
  // Magic link flows
  MAGIC_LINK_REQUEST = 'magic_link_request',
  MAGIC_LINK_VERIFY = 'magic_link_verify',
  MAGIC_LINK_SENT = 'magic_link_sent',
  
  // Phone flows
  PHONE_REQUEST = 'phone_request',
  PHONE_VERIFY = 'phone_verify',
  
  // Username flows
  USERNAME_SIGN_IN = 'username_sign_in',
  USERNAME_SIGN_UP = 'username_sign_up',
  
  // Passkey flows
  PASSKEY_REGISTER = 'passkey_register',
  PASSKEY_AUTHENTICATE = 'passkey_authenticate',
  
  // MFA flows
  MFA_REQUIRED = 'mfa_required',
  MFA_SETUP = 'mfa_setup',
  MFA_VERIFY = 'mfa_verify',
  MFA_SELECT_METHOD = 'mfa_select_method',
  
  // Verification flows
  EMAIL_VERIFICATION_REQUIRED = 'email_verification_required',
  EMAIL_VERIFICATION_SENT = 'email_verification_sent',
  PHONE_VERIFICATION_REQUIRED = 'phone_verification_required',
  
  // Password management
  PASSWORD_RESET_REQUEST = 'password_reset_request',
  PASSWORD_RESET_SENT = 'password_reset_sent',
  PASSWORD_RESET_CONFIRM = 'password_reset_confirm',
  PASSWORD_CHANGE = 'password_change',
  
  // Profile management
  PROFILE_UPDATE = 'profile_update',
  PROFILE_COMPLETE = 'profile_complete',
  
  // Terminal states
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled',
}

/**
 * Flow state data that can be passed between steps
 */
export interface FlowState {
  // Current step
  currentStep: FlowStep;
  
  // Previous step (for back navigation)
  previousStep?: FlowStep;
  
  // User data (populated after successful auth)
  user?: User;
  session?: Session;
  
  // Temporary data during flow
  email?: string;
  phone?: string;
  username?: string;
  
  // MFA context
  mfaRequired?: boolean;
  mfaMethods?: TwoFactorMethod[];
  mfaToken?: string;
  
  // OAuth context
  oauthProvider?: OAuthProvider;
  oauthRedirectUrl?: string;
  
  // Verification context
  verificationRequired?: boolean;
  verificationToken?: string;
  verificationSent?: boolean;
  
  // Error context
  error?: AuthError;
  
  // Custom metadata
  metadata?: Record<string, unknown>;
}

/**
 * Flow transition result
 */
export interface FlowTransition {
  nextStep: FlowStep;
  state: Partial<FlowState>;
}

/**
 * Flow configuration for a specific authentication journey
 */
export interface FlowConfig {
  name: string;
  description?: string;
  
  // Initial step
  initialStep: FlowStep;
  
  // Allowed steps in this flow
  allowedSteps: FlowStep[];
  
  // Step transitions
  transitions: {
    [key in FlowStep]?: {
      onSuccess?: FlowStep;
      onError?: FlowStep;
      onCancel?: FlowStep;
      onBack?: FlowStep;
      // Conditional transitions based on state
      conditions?: Array<{
        when: (state: FlowState) => boolean;
        then: FlowStep;
      }>;
    };
  };
  
  // Callbacks
  onStepChange?: (step: FlowStep, state: FlowState) => void;
  onComplete?: (user: User, session: Session) => void;
  onError?: (error: AuthError, state: FlowState) => void;
  onCancel?: (state: FlowState) => void;
}

/**
 * Predefined flow configurations
 */
export enum FlowConfigType {
  // Basic flows
  SIMPLE_SIGN_IN = 'simple_sign_in',
  SIMPLE_SIGN_UP = 'simple_sign_up',
  
  // Complete flows with verification
  SIGN_UP_WITH_EMAIL_VERIFICATION = 'sign_up_with_email_verification',
  SIGN_IN_WITH_MFA = 'sign_in_with_mfa',
  
  // OAuth flows
  OAUTH_SIGN_IN = 'oauth_sign_in',
  
  // Passwordless flows
  MAGIC_LINK_FLOW = 'magic_link_flow',
  PHONE_AUTH_FLOW = 'phone_auth_flow',
  
  // Advanced flows
  COMPLETE_SIGN_UP_FLOW = 'complete_sign_up_flow', // signup → verify email → complete profile
  SECURE_SIGN_IN_FLOW = 'secure_sign_in_flow', // signin → MFA → success
  
  // Password management
  PASSWORD_RESET_FLOW = 'password_reset_flow',
  
  // Email verification
  EMAIL_VERIFICATION_FLOW = 'email_verification_flow',
  
  // Custom
  CUSTOM = 'custom',
}

/**
 * Flow action types
 */
export enum FlowAction {
  START = 'start',
  NEXT = 'next',
  BACK = 'back',
  CANCEL = 'cancel',
  ERROR = 'error',
  RESET = 'reset',
}

/**
 * Flow event for state machine
 */
export interface FlowEvent {
  action: FlowAction;
  data?: Partial<FlowState>;
  error?: AuthError;
}


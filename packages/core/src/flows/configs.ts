/**
 * Predefined flow configurations
 */

import type { FlowConfig } from './types';
import { FlowStep, FlowConfigType } from './types';

/**
 * Simple sign-in flow (email/password only)
 */
export const simpleSignInFlow: FlowConfig = {
  name: 'Simple Sign In',
  description: 'Basic email/password sign-in',
  initialStep: FlowStep.EMAIL_PASSWORD_SIGN_IN,
  allowedSteps: [
    FlowStep.EMAIL_PASSWORD_SIGN_IN,
    FlowStep.PASSWORD_RESET_REQUEST,
    FlowStep.PASSWORD_RESET_SENT,
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.EMAIL_PASSWORD_SIGN_IN]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.EMAIL_PASSWORD_SIGN_IN,
    },
    [FlowStep.PASSWORD_RESET_REQUEST]: {
      onSuccess: FlowStep.PASSWORD_RESET_SENT,
      onBack: FlowStep.EMAIL_PASSWORD_SIGN_IN,
    },
    [FlowStep.PASSWORD_RESET_SENT]: {
      onSuccess: FlowStep.EMAIL_PASSWORD_SIGN_IN,
    },
  },
};

/**
 * Sign-in with MFA support
 */
export const signInWithMFAFlow: FlowConfig = {
  name: 'Sign In with MFA',
  description: 'Sign-in that handles MFA if enabled',
  initialStep: FlowStep.EMAIL_PASSWORD_SIGN_IN,
  allowedSteps: [
    FlowStep.EMAIL_PASSWORD_SIGN_IN,
    FlowStep.MFA_REQUIRED,
    FlowStep.MFA_SELECT_METHOD,
    FlowStep.MFA_VERIFY,
    FlowStep.PASSWORD_RESET_REQUEST,
    FlowStep.PASSWORD_RESET_SENT,
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.EMAIL_PASSWORD_SIGN_IN]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.EMAIL_PASSWORD_SIGN_IN,
      conditions: [
        {
          when: (state) => state.mfaRequired === true,
          then: FlowStep.MFA_REQUIRED,
        },
      ],
    },
    [FlowStep.MFA_REQUIRED]: {
      onSuccess: FlowStep.MFA_VERIFY,
      conditions: [
        {
          when: (state) => (state.mfaMethods?.length || 0) > 1,
          then: FlowStep.MFA_SELECT_METHOD,
        },
      ],
    },
    [FlowStep.MFA_SELECT_METHOD]: {
      onSuccess: FlowStep.MFA_VERIFY,
      onBack: FlowStep.EMAIL_PASSWORD_SIGN_IN,
    },
    [FlowStep.MFA_VERIFY]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.MFA_VERIFY,
      onBack: FlowStep.MFA_SELECT_METHOD,
    },
    [FlowStep.PASSWORD_RESET_REQUEST]: {
      onSuccess: FlowStep.PASSWORD_RESET_SENT,
      onBack: FlowStep.EMAIL_PASSWORD_SIGN_IN,
    },
  },
};

/**
 * Complete sign-up flow with email verification
 */
export const completeSignUpFlow: FlowConfig = {
  name: 'Complete Sign Up',
  description: 'Sign-up with email verification and profile completion',
  initialStep: FlowStep.EMAIL_PASSWORD_SIGN_UP,
  allowedSteps: [
    FlowStep.EMAIL_PASSWORD_SIGN_UP,
    FlowStep.EMAIL_VERIFICATION_REQUIRED,
    FlowStep.EMAIL_VERIFICATION_SENT,
    FlowStep.PROFILE_COMPLETE,
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.EMAIL_PASSWORD_SIGN_UP]: {
      onSuccess: FlowStep.EMAIL_VERIFICATION_REQUIRED,
      onError: FlowStep.EMAIL_PASSWORD_SIGN_UP,
      conditions: [
        {
          when: (state) => state.verificationRequired === false,
          then: FlowStep.PROFILE_COMPLETE,
        },
      ],
    },
    [FlowStep.EMAIL_VERIFICATION_REQUIRED]: {
      onSuccess: FlowStep.EMAIL_VERIFICATION_SENT,
    },
    [FlowStep.EMAIL_VERIFICATION_SENT]: {
      onSuccess: FlowStep.PROFILE_COMPLETE,
    },
    [FlowStep.PROFILE_COMPLETE]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.PROFILE_COMPLETE,
    },
  },
};

/**
 * Magic link authentication flow
 */
export const magicLinkFlow: FlowConfig = {
  name: 'Magic Link',
  description: 'Passwordless authentication via email',
  initialStep: FlowStep.MAGIC_LINK_REQUEST,
  allowedSteps: [
    FlowStep.MAGIC_LINK_REQUEST,
    FlowStep.MAGIC_LINK_SENT,
    FlowStep.MAGIC_LINK_VERIFY,
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.MAGIC_LINK_REQUEST]: {
      onSuccess: FlowStep.MAGIC_LINK_SENT,
      onError: FlowStep.MAGIC_LINK_REQUEST,
    },
    [FlowStep.MAGIC_LINK_SENT]: {
      onSuccess: FlowStep.MAGIC_LINK_VERIFY,
    },
    [FlowStep.MAGIC_LINK_VERIFY]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.MAGIC_LINK_REQUEST,
    },
  },
};

/**
 * Phone authentication flow
 */
export const phoneAuthFlow: FlowConfig = {
  name: 'Phone Authentication',
  description: 'SMS-based authentication',
  initialStep: FlowStep.PHONE_REQUEST,
  allowedSteps: [
    FlowStep.PHONE_REQUEST,
    FlowStep.PHONE_VERIFY,
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.PHONE_REQUEST]: {
      onSuccess: FlowStep.PHONE_VERIFY,
      onError: FlowStep.PHONE_REQUEST,
    },
    [FlowStep.PHONE_VERIFY]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.PHONE_VERIFY,
      onBack: FlowStep.PHONE_REQUEST,
    },
  },
};

/**
 * OAuth sign-in flow
 */
export const oauthSignInFlow: FlowConfig = {
  name: 'OAuth Sign In',
  description: 'Third-party OAuth authentication',
  initialStep: FlowStep.OAUTH_SELECT,
  allowedSteps: [
    FlowStep.OAUTH_SELECT,
    FlowStep.OAUTH_CALLBACK,
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.OAUTH_SELECT]: {
      onSuccess: FlowStep.OAUTH_CALLBACK,
      onError: FlowStep.OAUTH_SELECT,
    },
    [FlowStep.OAUTH_CALLBACK]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.OAUTH_SELECT,
    },
  },
};

/**
 * Password reset flow
 */
export const passwordResetFlow: FlowConfig = {
  name: 'Password Reset',
  description: 'Reset forgotten password',
  initialStep: FlowStep.PASSWORD_RESET_REQUEST,
  allowedSteps: [
    FlowStep.PASSWORD_RESET_REQUEST,
    FlowStep.PASSWORD_RESET_SENT,
    FlowStep.PASSWORD_RESET_CONFIRM,
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.PASSWORD_RESET_REQUEST]: {
      onSuccess: FlowStep.PASSWORD_RESET_SENT,
      onError: FlowStep.PASSWORD_RESET_REQUEST,
    },
    [FlowStep.PASSWORD_RESET_SENT]: {
      onSuccess: FlowStep.PASSWORD_RESET_CONFIRM,
    },
    [FlowStep.PASSWORD_RESET_CONFIRM]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.PASSWORD_RESET_CONFIRM,
    },
  },
};

/**
 * Get predefined flow configuration by type
 */
export function getFlowConfig(type: FlowConfigType): FlowConfig {
  switch (type) {
    case FlowConfigType.SIMPLE_SIGN_IN:
      return simpleSignInFlow;
    
    case FlowConfigType.SIGN_IN_WITH_MFA:
      return signInWithMFAFlow;
    
    case FlowConfigType.COMPLETE_SIGN_UP_FLOW:
      return completeSignUpFlow;
    
    case FlowConfigType.MAGIC_LINK_FLOW:
      return magicLinkFlow;
    
    case FlowConfigType.PHONE_AUTH_FLOW:
      return phoneAuthFlow;
    
    case FlowConfigType.OAUTH_SIGN_IN:
      return oauthSignInFlow;
    
    case FlowConfigType.PASSWORD_RESET_FLOW:
      return passwordResetFlow;
    
    default:
      throw new Error(`Unknown flow type: ${type}`);
  }
}

/**
 * Export all predefined flows
 */
export const predefinedFlows = {
  [FlowConfigType.SIMPLE_SIGN_IN]: simpleSignInFlow,
  [FlowConfigType.SIGN_IN_WITH_MFA]: signInWithMFAFlow,
  [FlowConfigType.COMPLETE_SIGN_UP_FLOW]: completeSignUpFlow,
  [FlowConfigType.MAGIC_LINK_FLOW]: magicLinkFlow,
  [FlowConfigType.PHONE_AUTH_FLOW]: phoneAuthFlow,
  [FlowConfigType.OAUTH_SIGN_IN]: oauthSignInFlow,
  [FlowConfigType.PASSWORD_RESET_FLOW]: passwordResetFlow,
};


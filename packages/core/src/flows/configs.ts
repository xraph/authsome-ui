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
    FlowStep.EMAIL_VERIFICATION_REQUIRED,
    FlowStep.EMAIL_VERIFICATION_SENT,
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
    [FlowStep.EMAIL_VERIFICATION_REQUIRED]: {
      onSuccess: FlowStep.EMAIL_VERIFICATION_SENT,
      onError: FlowStep.EMAIL_VERIFICATION_REQUIRED,
    },
    [FlowStep.EMAIL_VERIFICATION_SENT]: {
      onSuccess: FlowStep.EMAIL_PASSWORD_SIGN_IN,
      onError: FlowStep.EMAIL_VERIFICATION_REQUIRED,
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
    FlowStep.EMAIL_VERIFICATION_REQUIRED,
    FlowStep.EMAIL_VERIFICATION_SENT,
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
    [FlowStep.EMAIL_VERIFICATION_REQUIRED]: {
      onSuccess: FlowStep.EMAIL_VERIFICATION_SENT,
      onError: FlowStep.EMAIL_VERIFICATION_REQUIRED,
    },
    [FlowStep.EMAIL_VERIFICATION_SENT]: {
      onSuccess: FlowStep.EMAIL_PASSWORD_SIGN_IN,
      onError: FlowStep.EMAIL_VERIFICATION_REQUIRED,
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
 * Email verification flow
 */
export const emailVerificationFlow: FlowConfig = {
  name: 'Email Verification',
  description: 'Verify email address with code or link',
  initialStep: FlowStep.EMAIL_VERIFICATION_REQUIRED,
  allowedSteps: [
    FlowStep.EMAIL_VERIFICATION_REQUIRED,
    FlowStep.EMAIL_VERIFICATION_SENT,
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.EMAIL_VERIFICATION_REQUIRED]: {
      onSuccess: FlowStep.EMAIL_VERIFICATION_SENT,
      onError: FlowStep.EMAIL_VERIFICATION_REQUIRED,
    },
    [FlowStep.EMAIL_VERIFICATION_SENT]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.EMAIL_VERIFICATION_REQUIRED,
    },
  },
};

/**
 * Device flow (RFC 8628 - OAuth 2.0 Device Authorization Grant)
 * 
 * Used for CLI tools, smart TVs, and other input-constrained devices.
 * The user visits a URL and enters a code to authorize the device.
 * 
 * Flow:
 * 1. DEVICE_CODE_ENTRY - User enters the code shown on their device
 * 2. DEVICE_CODE_VERIFY - Code is verified and consent screen is shown
 * 3. DEVICE_AUTHORIZE - User approves or denies the authorization
 * 4. SUCCESS/DEVICE_DENIED - Authorization result
 */
export const deviceFlow: FlowConfig = {
  name: 'Device Flow',
  description: 'OAuth 2.0 Device Authorization Grant for CLI/device login',
  initialStep: FlowStep.DEVICE_CODE_ENTRY,
  allowedSteps: [
    FlowStep.DEVICE_CODE_ENTRY,
    FlowStep.DEVICE_CODE_VERIFY,
    FlowStep.DEVICE_AUTHORIZE,
    FlowStep.DEVICE_AUTHORIZED,
    FlowStep.DEVICE_DENIED,
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.DEVICE_CODE_ENTRY]: {
      onSuccess: FlowStep.DEVICE_CODE_VERIFY,
      onError: FlowStep.DEVICE_CODE_ENTRY,
      onCancel: FlowStep.CANCELLED,
    },
    [FlowStep.DEVICE_CODE_VERIFY]: {
      onSuccess: FlowStep.DEVICE_AUTHORIZE,
      onError: FlowStep.DEVICE_CODE_ENTRY,
      onBack: FlowStep.DEVICE_CODE_ENTRY,
    },
    [FlowStep.DEVICE_AUTHORIZE]: {
      onSuccess: FlowStep.DEVICE_AUTHORIZED,
      onError: FlowStep.DEVICE_DENIED,
      onCancel: FlowStep.DEVICE_DENIED,
    },
    [FlowStep.DEVICE_AUTHORIZED]: {
      onSuccess: FlowStep.SUCCESS,
    },
    [FlowStep.DEVICE_DENIED]: {
      onSuccess: FlowStep.ERROR,
    },
  },
};

/**
 * Device flow initiation (for CLI/device side)
 * 
 * Used by CLI tools to initiate the device flow and begin polling.
 * This flow is run on the device side, not the browser.
 */
export const deviceFlowInitiation: FlowConfig = {
  name: 'Device Flow Initiation',
  description: 'Initiate device flow and poll for authorization',
  initialStep: FlowStep.DEVICE_FLOW_INITIATE,
  allowedSteps: [
    FlowStep.DEVICE_FLOW_INITIATE,
    FlowStep.DEVICE_POLLING,
    FlowStep.SUCCESS,
    FlowStep.ERROR,
  ],
  transitions: {
    [FlowStep.DEVICE_FLOW_INITIATE]: {
      onSuccess: FlowStep.DEVICE_POLLING,
      onError: FlowStep.ERROR,
    },
    [FlowStep.DEVICE_POLLING]: {
      onSuccess: FlowStep.SUCCESS,
      onError: FlowStep.ERROR,
      onCancel: FlowStep.CANCELLED,
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
    
    case FlowConfigType.EMAIL_VERIFICATION_FLOW:
      return emailVerificationFlow;
    
    case FlowConfigType.DEVICE_FLOW:
      return deviceFlow;
    
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
  [FlowConfigType.EMAIL_VERIFICATION_FLOW]: emailVerificationFlow,
  [FlowConfigType.DEVICE_FLOW]: deviceFlow,
};


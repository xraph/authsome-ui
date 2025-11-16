/**
 * Authentication flow management
 * 
 * This module provides a state machine for managing complex authentication flows
 * with support for multi-step processes, conditional logic, and dynamic routing.
 */

// Export types
export type {
  FlowState,
  FlowConfig,
  FlowTransition,
  FlowEvent,
} from './types';

export {
  FlowStep,
  FlowConfigType,
  FlowAction,
} from './types';

// Export engine
export { FlowEngine } from './engine';

// Export configs
export { getFlowConfig, predefinedFlows } from './configs';

// Export individual configs for convenience
export {
  simpleSignInFlow,
  signInWithMFAFlow,
  completeSignUpFlow,
  magicLinkFlow,
  phoneAuthFlow,
  oauthSignInFlow,
  passwordResetFlow,
} from './configs';


/**
 * @authsome/ui-react
 * 
 * React bindings for AuthSome UI
 */

// Export context and provider
export * from './context/AuthProvider';

// Export hooks export
export * from './hooks';

// Export components
export * from './components';

// Export flows
export * from './flows';

// Export UI component types and utilities
export type {
  UIComponents, 
  InputProps, 
  ButtonProps, 
  CardProps, 
  AlertProps, 
  DividerProps, 
  LinkProps,
  CheckboxProps,
  LabelProps,
  SelectProps,
  SelectComponents,
  TextareaProps
} from './flows/ui-components';
export { validateUIComponents, REQUIRED_COMPONENTS } from './flows/ui-components';

// Export renderer configuration types
export type {
  RendererConfig,
  AuthMethodConfig,
  SignUpConfig,
  SignInConfig,
  CustomField,
  FieldType,
} from './flows/renderer-config';
export { defaultRendererConfig, mergeRendererConfig } from './flows/renderer-config';

// Export default components
export {
  DefaultInput,
  DefaultButton,
  DefaultCard,
  DefaultAlert,
  DefaultDivider,
  DefaultLink,
  DefaultCheckbox,
  DefaultLabel,
  DefaultSelect,
  DefaultTextarea,
} from './flows/default-components';

// Export built-in renderers
export { createBuiltInRenderers, createLoadingRenderer } from './flows/built-in-renderers';

// Export individual renderers for custom usage
export * from './flows/renderers';

// Re-export commonly used types from core
export type {
  User,
  Session,
  AuthState,
  AuthError,
  AuthErrorType,
  OAuthProvider,
  TwoFactorMethod,
  PasskeyCredential,
  SignInRequest,
  SignUpRequest,
  UpdateUserRequest,
  PasswordChangeRequest,
  PasswordResetRequest,
  PasswordResetConfirmRequest,
  OAuthSignInRequest,
  OAuthCallbackRequest,
  MagicLinkRequest,
  MagicLinkVerifyRequest,
  PhoneAuthRequest,
  PhoneVerifyRequest,
  TwoFactorSetupRequest,
  TwoFactorSetupResponse,
  TwoFactorVerifyRequest,
  PasskeyRegisterRequest,
  PasskeyAuthRequest,
  // Flow types (for convenience - these live in core)
  FlowStep,
  FlowState,
  FlowConfig,
  FlowEvent,
  FlowAction,
  FlowTransition,
  FlowConfigType,
} from '@authsome/ui-core';

// Re-export flow functions from core (for convenience)
export { getFlowConfig, predefinedFlows } from '@authsome/ui-core';


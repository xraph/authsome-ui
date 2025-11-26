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
  CardComponents,
  AlertComponents, 
  DividerProps, 
  LinkProps,
  CheckboxProps,
  LabelProps,
  SelectProps,
  SelectComponents,
  TextareaProps,
  FieldComponents
} from './flows/ui-components';
export { validateUIComponents, REQUIRED_COMPONENTS } from './flows/ui-components';

// Export renderer configuration types
export type {
  RendererConfig,
  AuthMethodConfig,
  AuthMethodKey,
  SignUpConfig,
  SignInConfig,
  CustomField,
  FieldType,
  RedirectConfig,
  BuiltInFieldOrder,
} from './flows/renderer-config';
export { defaultRendererConfig, mergeRendererConfig, DEFAULT_BUILTIN_FIELD_ORDER } from './flows/renderer-config';

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
  DefaultField,
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
  FlowEngine,
} from '@authsome/ui-core';

// Re-export flow functions from core (for convenience)
export { getFlowConfig, predefinedFlows } from '@authsome/ui-core';

// Re-export locale types and utilities from core (for i18n support)
export type { AuthLocale, DeepPartial } from '@authsome/ui-core';
export { defaultLocale, createLocale, interpolate } from '@authsome/ui-core';


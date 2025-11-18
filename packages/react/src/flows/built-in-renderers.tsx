/**
 * Built-in renderers factory
 * 
 * Creates complete renderers for all flow steps using provided UI components
 */

import { FlowStep } from '@authsome/ui-core';
import type { UIComponents } from './ui-components';
import type { RendererConfig } from './renderer-config';
import { EmailPasswordRenderer } from './renderers/EmailPasswordRenderer';
import { UnifiedAuthRenderer } from './renderers/UnifiedAuthRenderer';
import { MagicLinkRenderer, MagicLinkSentRenderer } from './renderers/MagicLinkRenderer';
import { PhoneAuthRenderer, PhoneVerifyRenderer } from './renderers/PhoneAuthRenderer';
import { OAuthRenderer, OAuthCallbackRenderer } from './renderers/OAuthRenderer';
import { PasskeyRenderer } from './renderers/PasskeyRenderer';
import { MFARequiredRenderer, MFASelectMethodRenderer, MFAVerifyRenderer } from './renderers/MFARenderer';
import { SuccessRenderer } from './renderers/SuccessRenderer';
import { ErrorRenderer } from './renderers/ErrorRenderer';

/**
 * Create built-in renderers for all flow steps
 * 
 * @param uiComponents - UI components to use for rendering
 * @param rendererConfig - Optional renderer configuration (auth methods, custom fields, etc.)
 */
export function createBuiltInRenderers(uiComponents: UIComponents, rendererConfig?: RendererConfig) {
  // If rendererConfig is provided and has multiple auth methods or custom fields,
  // use UnifiedAuthRenderer for email/password steps
  const shouldUseUnified = rendererConfig && (
    (rendererConfig.authMethods?.oauth) ||
    (rendererConfig.authMethods?.magicLink) ||
    (rendererConfig.authMethods?.phone) ||
    (rendererConfig.signUp?.customFields && rendererConfig.signUp.customFields.length > 0)
  );

  return {
    // Email/Password flows - use UnifiedAuthRenderer if config is provided
    [FlowStep.EMAIL_PASSWORD_SIGN_IN]: (props: any) => 
      shouldUseUnified ? (
        <UnifiedAuthRenderer 
          {...props} 
          uiComponents={uiComponents} 
          rendererConfig={rendererConfig}
          mode="signin" 
        />
      ) : (
        <EmailPasswordRenderer {...props} uiComponents={uiComponents} mode="signin" />
      ),
    [FlowStep.EMAIL_PASSWORD_SIGN_UP]: (props: any) => 
      shouldUseUnified ? (
        <UnifiedAuthRenderer 
          {...props} 
          uiComponents={uiComponents} 
          rendererConfig={rendererConfig}
          mode="signup" 
        />
      ) : (
        <EmailPasswordRenderer {...props} uiComponents={uiComponents} mode="signup" />
      ),

    // OAuth flows
    [FlowStep.OAUTH_SELECT]: (props: any) => (
      <OAuthRenderer {...props} uiComponents={uiComponents} rendererConfig={rendererConfig} />
    ),
    [FlowStep.OAUTH_CALLBACK]: (props: any) => (
      <OAuthCallbackRenderer {...props} uiComponents={uiComponents} />
    ),

    // Magic Link flows
    [FlowStep.MAGIC_LINK_REQUEST]: (props: any) => (
      <MagicLinkRenderer {...props} uiComponents={uiComponents} />
    ),
    [FlowStep.MAGIC_LINK_SENT]: (props: any) => (
      <MagicLinkSentRenderer {...props} uiComponents={uiComponents} />
    ),

    // Phone flows
    [FlowStep.PHONE_REQUEST]: (props: any) => (
      <PhoneAuthRenderer {...props} uiComponents={uiComponents} />
    ),
    [FlowStep.PHONE_VERIFY]: (props: any) => (
      <PhoneVerifyRenderer {...props} uiComponents={uiComponents} />
    ),

    // Passkey
    [FlowStep.PASSKEY_AUTHENTICATE]: (props: any) => (
      <PasskeyRenderer {...props} uiComponents={uiComponents} />
    ),

    // MFA flows
    [FlowStep.MFA_REQUIRED]: (props: any) => (
      <MFARequiredRenderer {...props} uiComponents={uiComponents} />
    ),
    [FlowStep.MFA_SELECT_METHOD]: (props: any) => (
      <MFASelectMethodRenderer {...props} uiComponents={uiComponents} />
    ),
    [FlowStep.MFA_VERIFY]: (props: any) => (
      <MFAVerifyRenderer {...props} uiComponents={uiComponents} />
    ),

    // Success
    [FlowStep.SUCCESS]: (props: any) => (
      <SuccessRenderer {...props} uiComponents={uiComponents} />
    ),

    // Error
    [FlowStep.ERROR]: (props: any) => (
      <ErrorRenderer {...props} uiComponents={uiComponents} />
    ),
  };
}

/**
 * Loading renderer
 */
export function createLoadingRenderer(uiComponents: UIComponents) {
  const { icons } = uiComponents;
  const LoadingIcon = icons?.loading;

  const LoadingRenderer = () => (
    <div className="flex flex-col items-center justify-center py-12">
      {LoadingIcon ? (
        <LoadingIcon className="h-12 w-12 text-blue-600 animate-spin" />
      ) : (
        <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      )}
      <p className="text-gray-600 mt-4">Processing...</p>
    </div>
  );
  LoadingRenderer.displayName = 'LoadingRenderer';
  
  return LoadingRenderer;
}


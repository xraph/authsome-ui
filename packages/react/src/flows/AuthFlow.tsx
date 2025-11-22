/**
 * Dynamic auth flow component
 * 
 * Renders the appropriate UI based on current flow step
 */

import React, { useMemo } from 'react';
import { FlowStep } from '@authsome/ui-core';
import { useFlow } from './FlowContext';
import { createBuiltInRenderers, createLoadingRenderer } from './built-in-renderers';

export interface AuthFlowProps {
  /**
   * Custom renderers for each step (overrides built-in renderers)
   */
  renderers?: Partial<Record<FlowStep, React.ComponentType<any>>>;
  
  /**
   * Use built-in renderers (default: true)
   * Set to false if you want to provide all custom renderers
   */
  useBuiltInRenderers?: boolean;
  
  /**
   * Default renderer if no custom renderer is provided
   */
  defaultRenderer?: React.ComponentType<any>;
  
  /**
   * Loading component
   */
  loadingComponent?: React.ComponentType;
  
  /**
   * Error component
   */
  errorComponent?: React.ComponentType<{ error: any }>;
  
  /**
   * Success component
   */
  successComponent?: React.ComponentType<{ user: any; session: any }>;
  
  /**
   * Additional props to pass to renderers
   */
  rendererProps?: Record<string, any>;
}

export function AuthFlow({
  renderers = {},
  useBuiltInRenderers = true,
  defaultRenderer: DefaultRenderer,
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  successComponent: SuccessComponent,
  rendererProps = {},
}: AuthFlowProps) {
  const { state, currentStep, isLoading, next, back, cancel, uiComponents, rendererConfig } = useFlow();
  
  // Create built-in renderers from UI components and renderer config
  const builtInRenderers = useMemo(() => {
    if (!useBuiltInRenderers || !uiComponents) {
      return {};
    }
    return createBuiltInRenderers(uiComponents, rendererConfig);
  }, [useBuiltInRenderers, uiComponents, rendererConfig]);
  
  // Merge custom renderers with built-in renderers (custom takes priority)
  const allRenderers = useMemo(() => ({
    ...builtInRenderers,
    ...renderers,
  }), [builtInRenderers, renderers]);
  
  // Create default loading component if not provided
  const defaultLoadingComponent = useMemo(() => {
    if (LoadingComponent || !uiComponents) return LoadingComponent;
    return createLoadingRenderer(uiComponents);
  }, [LoadingComponent, uiComponents]);

  // Show loading component if available
  const ActiveLoadingComponent = defaultLoadingComponent;
  if (isLoading && ActiveLoadingComponent) {
    return <ActiveLoadingComponent />;
  }

  // Show success component (custom takes priority over built-in)
  if (currentStep === FlowStep.SUCCESS) {
    // Verify we have valid user and session data
    if (!state.user || !state.session) {
      console.error('[AuthFlow] SUCCESS step reached without user/session data');
      console.error('[AuthFlow] Current state:', state);
      // Transition to error state
      const ErrorRenderer = ErrorComponent || allRenderers[FlowStep.ERROR];
      if (ErrorRenderer) {
        const error = state.error || {
          message: 'Authentication succeeded but user data is missing',
          type: 'UNKNOWN_ERROR' as const,
        };
        return <ErrorRenderer error={error} />;
      }
    }
    
    const SuccessRenderer = SuccessComponent || allRenderers[FlowStep.SUCCESS];
    if (SuccessRenderer) {
      return <SuccessRenderer user={state.user} session={state.session} />;
    }
  }

  // Show error component (custom takes priority over built-in)
  if (currentStep === FlowStep.ERROR && state.error) {
    const ErrorRenderer = ErrorComponent || allRenderers[FlowStep.ERROR];
    if (ErrorRenderer) {
      return <ErrorRenderer error={state.error} />;
    }
  }

  // Get renderer for current step (custom renderers take priority over built-in)
  const StepRenderer = allRenderers[currentStep];
  
  if (StepRenderer) {
    return (
      <StepRenderer
        state={state}
        onNext={next}
        onBack={back}
        onCancel={cancel}
        isLoading={isLoading}
        {...rendererProps}
      />
    );
  }

  // Use default renderer if provided
  if (DefaultRenderer) {
    return (
      <DefaultRenderer
        state={state}
        currentStep={currentStep}
        onNext={next}
        onBack={back}
        onCancel={cancel}
        isLoading={isLoading}
        {...rendererProps}
      />
    );
  }

  // Fallback: show current step name
  return (
    <div>
      <p>Current step: {currentStep}</p>
      <p>No renderer configured for this step</p>
    </div>
  );
}


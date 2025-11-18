/**
 * Flow provider component
 */

import React, { useState, useCallback, useMemo } from 'react';
import { FlowEngine, FlowAction, createLocale, type FlowConfig, type FlowState, type FlowEvent, type AuthLocale, type DeepPartial } from '@authsome/ui-core';
import { FlowContext, type FlowContextValue } from './FlowContext';
import type { UIComponents } from './ui-components';
import { validateUIComponents } from './ui-components';
import type { RendererConfig } from './renderer-config';
import { mergeRendererConfig } from './renderer-config';
import {
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
} from './default-components';

export interface FlowProviderProps {
  /**
   * Flow configuration
   */
  config: FlowConfig;
  
  /**
   * Initial state (optional)
   */
  initialState?: Partial<FlowState>;
  
  /**
   * UI components for rendering (e.g., shadcn components)
   * Pass your custom components or use defaults
   */
  uiComponents?: Partial<UIComponents>;
  
  /**
   * Renderer configuration (auth methods, custom fields, etc.)
   */
  rendererConfig?: RendererConfig;
  
  /**
   * Locale configuration for internationalization
   */
  locale?: DeepPartial<AuthLocale>;
  
  /**
   * Children
   */
  children: React.ReactNode;
  
  /**
   * Callback when state changes
   */
  onStateChange?: (state: FlowState) => void;
}

export function FlowProvider({ config, initialState, uiComponents = {}, rendererConfig, locale, children, onStateChange }: FlowProviderProps) {
  // Create complete locale by merging with defaults
  const completeLocale = useMemo(() => {
    const mergedLocaleOverrides = {
      ...rendererConfig?.locale,
      ...locale,
    };
    return createLocale(mergedLocaleOverrides);
  }, [rendererConfig?.locale, locale]);
  
  // Merge renderer config with defaults and attach locale
  const completeRendererConfig = useMemo(() => {
    const merged = mergeRendererConfig(rendererConfig);
    return {
      ...merged,
      locale: completeLocale,
    };
  }, [rendererConfig, completeLocale]);

  // Validate and merge UI components with defaults
  const completeUIComponents: UIComponents = useMemo(() => {
    const validation = validateUIComponents(uiComponents);
    
    // Warn about missing components in development
    if (typeof window !== 'undefined' && !validation.isValid) {
      console.error(
        '[AuthSome UI] Missing required UI components:',
        validation.missing.join(', ')
      );
      console.error('Using default components as fallback. This may not match your design system.');
    }
    
    if (typeof window !== 'undefined' && validation.warnings.length > 0) {
      validation.warnings.forEach(warning => console.warn(`[AuthSome UI] ${warning}`));
    }
    
    // Merge with defaults
    return {
      Input: uiComponents.Input || DefaultInput,
      Button: uiComponents.Button || DefaultButton,
      Field: uiComponents.Field || DefaultField,
      Checkbox: uiComponents.Checkbox || DefaultCheckbox,
      Label: uiComponents.Label || DefaultLabel,
      Select: uiComponents.Select || DefaultSelect,
      Textarea: uiComponents.Textarea || DefaultTextarea,
      Card: uiComponents.Card || DefaultCard,
      Alert: uiComponents.Alert || DefaultAlert,
      Divider: uiComponents.Divider || DefaultDivider,
      Link: uiComponents.Link || DefaultLink,
      icons: uiComponents.icons,
      providerIcons: uiComponents.providerIcons,
    };
  }, [uiComponents]);

  // Initialize flow engine
  const engine = useMemo(() => new FlowEngine(config, initialState), [config, initialState]);
  
  // Flow state
  const [state, setState] = useState<FlowState>(engine.getState());
  const [isLoading, setIsLoading] = useState(false);

  // Dispatch flow event
  const dispatch = useCallback(async (event: FlowEvent) => {
    setIsLoading(true);
    try {
      const newState = await engine.transition(event);
      setState(newState);
      
      if (onStateChange) {
        onStateChange(newState);
      }
    } finally {
      setIsLoading(false);
    }
  }, [engine, onStateChange]);

  // Convenience methods
  const next = useCallback((data?: Partial<FlowState>) => {
    return dispatch({ action: FlowAction.NEXT, data });
  }, [dispatch]);

  const back = useCallback(() => {
    return dispatch({ action: FlowAction.BACK });
  }, [dispatch]);

  const cancel = useCallback(() => {
    return dispatch({ action: FlowAction.CANCEL });
  }, [dispatch]);

  const reset = useCallback(() => {
    return dispatch({ action: FlowAction.RESET });
  }, [dispatch]);

  // Context value
  const value: FlowContextValue = useMemo(() => ({
    engine,
    state,
    dispatch,
    next,
    back,
    cancel,
    reset,
    canGoBack: engine.canGoBack(),
    currentStep: state.currentStep,
    isLoading,
    uiComponents: completeUIComponents, // Provide UI components to context
    rendererConfig: completeRendererConfig, // Provide renderer config to context
  }), [engine, state, dispatch, next, back, cancel, reset, isLoading, completeUIComponents, completeRendererConfig]);

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  );
}


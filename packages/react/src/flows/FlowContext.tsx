/**
 * React context for authentication flows
 */

import { createContext, useContext } from 'react';
import type { FlowEngine, FlowState, FlowStep, FlowEvent } from '@authsome/ui-core';
import type { UIComponents } from './ui-components';
import type { RendererConfig } from './renderer-config';

export interface FlowContextValue {
  /**
   * Flow engine instance
   */
  engine: FlowEngine;
  
  /**
   * Current flow state
   */
  state: FlowState;
  
  /**
   * Dispatch a flow event
   */
  dispatch: (event: FlowEvent) => Promise<void>;
  
  /**
   * Go to next step with data
   */
  next: (data?: Partial<FlowState>) => Promise<void>;
  
  /**
   * Go back to previous step
   */
  back: () => Promise<void>;
  
  /**
   * Cancel the flow
   */
  cancel: () => Promise<void>;
  
  /**
   * Reset the flow
   */
  reset: () => Promise<void>;
  
  /**
   * Check if can go back
   */
  canGoBack: boolean;
  
  /**
   * Current step
   */
  currentStep: FlowStep;
  
  /**
   * Loading state
   */
  isLoading: boolean;
  
  /**
   * UI components for renderers
   */
  uiComponents?: UIComponents;
  
  /**
   * Renderer configuration
   */
  rendererConfig?: RendererConfig;
}

export const FlowContext = createContext<FlowContextValue | null>(null);

export function useFlow(): FlowContextValue {
  const context = useContext(FlowContext);
  
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  
  return context;
}


/**
 * Authentication flow state machine engine
 */

import type { FlowConfig, FlowState, FlowStep, FlowEvent } from './types';
import { AuthError, AuthErrorType } from '../types';

/**
 * Flow engine that manages authentication flow state transitions
 */
export class FlowEngine {
  private config: FlowConfig;
  private state: FlowState;
  private history: FlowStep[] = [];

  constructor(config: FlowConfig, initialState?: Partial<FlowState>) {
    this.config = config;
    this.state = {
      currentStep: config.initialStep,
      ...initialState,
    };
    this.history.push(this.state.currentStep);
  }

  /**
   * Get current flow state
   */
  getState(): FlowState {
    return { ...this.state };
  }

  /**
   * Get current step
   */
  getCurrentStep(): FlowStep {
    return this.state.currentStep;
  }

  /**
   * Check if step is allowed in this flow
   */
  isStepAllowed(step: FlowStep): boolean {
    return this.config.allowedSteps.includes(step);
  }

  /**
   * Transition to next step based on action
   */
  async transition(event: FlowEvent): Promise<FlowState> {
    const { action, data, error } = event;

    switch (action) {
      case 'start':
        return this.handleStart(data);
      
      case 'next':
        return this.handleNext(data);
      
      case 'back':
        return this.handleBack();
      
      case 'cancel':
        return this.handleCancel();
      
      case 'error':
        return this.handleError(error);
      
      case 'reset':
        return this.handleReset();
      
      default:
        throw new AuthError(
          `Unknown flow action: ${action}`,
          AuthErrorType.VALIDATION_ERROR
        );
    }
  }

  /**
   * Start or restart the flow
   */
  private handleStart(data?: Partial<FlowState>): FlowState {
    this.state = {
      currentStep: this.config.initialStep,
      ...data,
    };
    this.history = [this.state.currentStep];
    
    if (this.config.onStepChange) {
      this.config.onStepChange(this.state.currentStep, this.state);
    }
    
    return this.getState();
  }

  /**
   * Move to next step
   */
  private handleNext(data?: Partial<FlowState>): FlowState {
    // Update state with new data
    this.state = {
      ...this.state,
      ...data,
      previousStep: this.state.currentStep,
    };

    // Get transition config for current step
    const transitionConfig = this.config.transitions[this.state.currentStep];
    
    if (!transitionConfig) {
      throw new AuthError(
        `No transition configured for step: ${this.state.currentStep}`,
        AuthErrorType.VALIDATION_ERROR
      );
    }

    // Check conditional transitions first
    if (transitionConfig.conditions) {
      for (const condition of transitionConfig.conditions) {
        if (condition.when(this.state)) {
          return this.moveToStep(condition.then);
        }
      }
    }

    // Use default onSuccess transition
    if (transitionConfig.onSuccess) {
      return this.moveToStep(transitionConfig.onSuccess);
    }

    throw new AuthError(
      `No valid transition found for step: ${this.state.currentStep}`,
      AuthErrorType.VALIDATION_ERROR
    );
  }

  /**
   * Go back to previous step
   */
  private handleBack(): FlowState {
    if (this.history.length < 2) {
      throw new AuthError(
        'Cannot go back - already at first step',
        AuthErrorType.VALIDATION_ERROR
      );
    }

    // Remove current step from history
    this.history.pop();
    
    // Get previous step
    const previousStep = this.history[this.history.length - 1];
    
    // Get transition config
    const transitionConfig = this.config.transitions[this.state.currentStep];
    
    // Use configured back step if available, otherwise use history
    const targetStep = transitionConfig?.onBack || previousStep;
    
    return this.moveToStep(targetStep, false); // Don't add to history
  }

  /**
   * Cancel the flow
   */
  private handleCancel(): FlowState {
    const transitionConfig = this.config.transitions[this.state.currentStep];
    const targetStep = transitionConfig?.onCancel;

    if (this.config.onCancel) {
      this.config.onCancel(this.state);
    }

    if (targetStep) {
      return this.moveToStep(targetStep);
    }

    // Default to cancelled state
    this.state.currentStep = 'cancelled' as FlowStep;
    return this.getState();
  }

  /**
   * Handle error in flow
   */
  private handleError(error?: AuthError): FlowState {
    this.state.error = error;

    const transitionConfig = this.config.transitions[this.state.currentStep];
    const targetStep = transitionConfig?.onError;

    if (this.config.onError) {
      this.config.onError(error!, this.state);
    }

    if (targetStep) {
      return this.moveToStep(targetStep);
    }

    // Stay on current step with error
    return this.getState();
  }

  /**
   * Reset flow to initial state
   */
  private handleReset(): FlowState {
    return this.handleStart();
  }

  /**
   * Move to a specific step
   */
  private moveToStep(step: FlowStep, addToHistory = true): FlowState {
    if (!this.isStepAllowed(step)) {
      throw new AuthError(
        `Step ${step} is not allowed in this flow`,
        AuthErrorType.VALIDATION_ERROR
      );
    }

    this.state.currentStep = step;
    
    if (addToHistory) {
      this.history.push(step);
    }

    if (this.config.onStepChange) {
      this.config.onStepChange(step, this.state);
    }

    // Check if flow is complete
    if (step === 'success' && this.state.user && this.state.session) {
      if (this.config.onComplete) {
        this.config.onComplete(this.state.user, this.state.session);
      }
    }

    return this.getState();
  }

  /**
   * Get flow history
   */
  getHistory(): FlowStep[] {
    return [...this.history];
  }

  /**
   * Check if can go back
   */
  canGoBack(): boolean {
    return this.history.length > 1;
  }
}


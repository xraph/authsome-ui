/**
 * React Context Provider for AuthSome UI
 */

import React, { createContext, useEffect, useState, useMemo, useCallback } from 'react';
import { FlowEngine, FlowAction, createLocale } from '@authsome/ui-core';
import type { 
  AuthClient, 
  AuthContext as AuthStateContext,
  FlowConfig,
  FlowState,
  FlowEvent,
  Organization,
  AuthLocale,
  DeepPartial,
} from '@authsome/ui-core';
import type { UIComponents } from '../flows/ui-components';
import type { RendererConfig } from '../flows/renderer-config';
import { FlowContext, type FlowContextValue } from '../flows/FlowContext';
import { validateUIComponents } from '../flows/ui-components';
import { mergeRendererConfig } from '../flows/renderer-config';
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
} from '../flows/default-components';

/**
 * Auth context value with direct method access for better DX
 */
export interface AuthContextValue extends AuthStateContext {
  client: AuthClient;
  adapter?: AuthClient['adapter']; // Expose adapter for dynamic field access
  
  // Direct method access (delegates to client) - all optional to handle methods that may not exist
  // Core auth methods
  signIn?: AuthClient['signIn'];
  signUp?: AuthClient['signUp'];
  signOut?: AuthClient['signOut'];
  
  // User management
  updateUser?: AuthClient['updateUser'];
  
  // Password management
  changePassword?: AuthClient['changePassword'];
  requestPasswordReset?: AuthClient['requestPasswordReset'];
  confirmPasswordReset?: AuthClient['confirmPasswordReset'];
  
  // OAuth methods (mapped to actual AuthClient methods)
  oauthSignIn?: AuthClient['getOAuthUrl'];
  oauthCallback?: AuthClient['handleOAuthCallback'];
  getOAuthProviders?: AuthClient['getOAuthProviders'];
  
  // Magic link methods
  sendMagicLink?: AuthClient['sendMagicLink'];
  verifyMagicLink?: AuthClient['verifyMagicLink'];
  
  // Phone auth methods
  sendPhoneCode?: AuthClient['sendPhoneCode'];
  verifyPhoneCode?: AuthClient['verifyPhoneCode'];
  
  // Two-factor auth methods
  setupTwoFactor?: AuthClient['setupTwoFactor'];
  verifyTwoFactor?: AuthClient['verifyTwoFactor'];
  disableTwoFactor?: AuthClient['disableTwoFactor'];
  getTwoFactorStatus?: AuthClient['getTwoFactorStatus'];
  
  // Passkey methods
  registerPasskey?: AuthClient['registerPasskey'];
  authenticatePasskey?: AuthClient['authenticatePasskey'];
  listPasskeys?: AuthClient['listPasskeys'];
  deletePasskey?: AuthClient['deletePasskey'];
  
  // Session management
  refreshSession?: AuthClient['refreshSession'];
  
  // Flow engine access (merged from FlowProvider)
  flowEngine?: FlowEngine;
  flowState?: FlowState;
  dispatch?: (event: FlowEvent) => Promise<void>;
  nextFlow?: (data?: Partial<FlowState>) => Promise<void>;
  backFlow?: () => Promise<void>;
  cancelFlow?: () => Promise<void>;
  resetFlow?: () => Promise<void>;
  canGoBack?: boolean;
  currentStep?: FlowState['currentStep'];
  isFlowLoading?: boolean;
  uiComponents?: UIComponents;
  rendererConfig?: RendererConfig;
  
  // Organization methods (optional - only available if adapter supports)
  getOrganizations?: () => Promise<Organization[]>;
  getActiveOrganization?: () => Promise<Organization | null>;
  setActiveOrganization?: (orgId: string) => Promise<void>;
  organizations?: Organization[];
  activeOrganization?: Organization | null;
  supportsOrganizations?: boolean;
}

/**
 * Auth React context
 */
export const AuthReactContext = createContext<AuthContextValue | null>(null);

/**
 * Auth provider props
 */
export interface AuthProviderProps {
  client: AuthClient;
  children: React.ReactNode;
  
  // Flow configuration (merged from FlowProvider)
  flows?: FlowConfig;
  initialFlowState?: Partial<FlowState>;
  uiComponents?: Partial<UIComponents>;
  rendererConfig?: RendererConfig;
  onFlowStateChange?: (state: FlowState) => void;
  
  // Locale configuration (i18n support)
  locale?: DeepPartial<AuthLocale>;
  
  // Organization callbacks
  onOrganizationChange?: (org: Organization | null) => void;
}

/**
 * Auth provider component
 * 
 * Wraps your app and provides auth state to all components
 * Now includes flow management and organization support
 */
export function AuthProvider({ 
  client, 
  children,
  flows,
  initialFlowState,
  uiComponents = {},
  rendererConfig,
  locale,
  onFlowStateChange,
  onOrganizationChange,
}: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthStateContext>(client.state.getValue());
  
  // Create complete locale by merging with defaults
  const completeLocale = useMemo(() => {
    // Merge locale from props and rendererConfig.locale
    const mergedLocaleOverrides = {
      ...rendererConfig?.locale,
      ...locale,
    };
    return createLocale(mergedLocaleOverrides);
  }, [rendererConfig?.locale, locale]);
  
  // Flow state management (merged from FlowProvider)
  const completeRendererConfig = useMemo(() => {
    const merged = mergeRendererConfig(rendererConfig);
    // Attach complete locale to renderer config for easy access in renderers
    return {
      ...merged,
      locale: completeLocale,
    };
  }, [rendererConfig, completeLocale]);
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

  // Initialize flow engine if flows are provided
  const flowEngine = useMemo(() => 
    flows ? new FlowEngine(flows, initialFlowState) : undefined,
    [flows, initialFlowState]
  );
  
  const [flowState, setFlowState] = useState<FlowState | undefined>(
    flowEngine?.getState()
  );
  const [isFlowLoading, setIsFlowLoading] = useState(false);

  // Organization state
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);

  useEffect(() => {
    // Initialize client
    client.initialize();

    // Subscribe to auth state changes
    const unsubscribe = client.subscribe((state) => {
      setAuthState(state);
      
      // Load organizations when user logs in
      if (state.isAuthenticated && client.supportsOrganizations()) {
        loadOrganizations();
      }
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [client]);

  // Load organizations
  const loadOrganizations = useCallback(async () => {
    try {
      if (client.supportsOrganizations()) {
        const orgs = await client.getOrganizations();
        setOrganizations(orgs);
        
        const activeOrg = await client.getActiveOrganization();
        setActiveOrganization(activeOrg);
        
        if (onOrganizationChange) {
          onOrganizationChange(activeOrg);
        }
      }
    } catch (error) {
      console.error('[AuthSome UI] Failed to load organizations:', error);
    }
  }, [client, onOrganizationChange]);

  // Flow dispatch
  const dispatch = useCallback(async (event: FlowEvent) => {
    if (!flowEngine) return;
    
    setIsFlowLoading(true);
    try {
      const newState = await flowEngine.transition(event);
      setFlowState(newState);
      
      if (onFlowStateChange) {
        onFlowStateChange(newState);
      }
    } finally {
      setIsFlowLoading(false);
    }
  }, [flowEngine, onFlowStateChange]);

  // Convenience flow methods
  const nextFlow = useCallback((data?: Partial<FlowState>) => {
    return dispatch({ action: FlowAction.NEXT, data });
  }, [dispatch]);

  const backFlow = useCallback(() => {
    return dispatch({ action: FlowAction.BACK });
  }, [dispatch]);

  const cancelFlow = useCallback(() => {
    return dispatch({ action: FlowAction.CANCEL });
  }, [dispatch]);

  const resetFlow = useCallback(() => {
    return dispatch({ action: FlowAction.RESET });
  }, [dispatch]);

  // Organization methods
  const getOrganizationsWrapped = useCallback(async () => {
    const orgs = await client.getOrganizations();
    setOrganizations(orgs);
    return orgs;
  }, [client]);

  const getActiveOrganizationWrapped = useCallback(async () => {
    const org = await client.getActiveOrganization();
    setActiveOrganization(org);
    return org;
  }, [client]);

  const setActiveOrganizationWrapped = useCallback(async (orgId: string) => {
    await client.setActiveOrganization(orgId);
    const org = await client.getActiveOrganization();
    setActiveOrganization(org);
    
    if (onOrganizationChange) {
      onOrganizationChange(org);
    }
  }, [client, onOrganizationChange]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      client,
      adapter: client.adapter, // Expose adapter for dynamic field access
      
      // Expose methods directly for better DX (with safe binding)
      // Core auth methods
      signIn: client.signIn?.bind(client),
      signUp: client.signUp?.bind(client),
      signOut: client.signOut?.bind(client),
      
      // User management
      updateUser: client.updateUser?.bind(client),
      
      // Password management
      changePassword: client.changePassword?.bind(client),
      requestPasswordReset: client.requestPasswordReset?.bind(client),
      confirmPasswordReset: client.confirmPasswordReset?.bind(client),
      
      // OAuth methods (using actual method names from AuthClient)
      oauthSignIn: client.getOAuthUrl?.bind(client),
      oauthCallback: client.handleOAuthCallback?.bind(client),
      getOAuthProviders: client.getOAuthProviders?.bind(client),
      
      // Magic link methods
      sendMagicLink: client.sendMagicLink?.bind(client),
      verifyMagicLink: client.verifyMagicLink?.bind(client),
      
      // Phone auth methods
      sendPhoneCode: client.sendPhoneCode?.bind(client),
      verifyPhoneCode: client.verifyPhoneCode?.bind(client),
      
      // Two-factor auth methods
      setupTwoFactor: client.setupTwoFactor?.bind(client),
      verifyTwoFactor: client.verifyTwoFactor?.bind(client),
      disableTwoFactor: client.disableTwoFactor?.bind(client),
      getTwoFactorStatus: client.getTwoFactorStatus?.bind(client),
      
      // Passkey methods
      registerPasskey: client.registerPasskey?.bind(client),
      authenticatePasskey: client.authenticatePasskey?.bind(client),
      listPasskeys: client.listPasskeys?.bind(client),
      deletePasskey: client.deletePasskey?.bind(client),
      
      // Session management
      refreshSession: client.refreshSession?.bind(client),
      
      // Flow engine access (merged from FlowProvider)
      flowEngine,
      flowState,
      dispatch,
      nextFlow,
      backFlow,
      cancelFlow,
      resetFlow,
      canGoBack: flowEngine?.canGoBack(),
      currentStep: flowState?.currentStep,
      isFlowLoading,
      uiComponents: completeUIComponents,
      rendererConfig: completeRendererConfig,
      
      // Organization methods (only if supported)
      getOrganizations: client.supportsOrganizations() ? getOrganizationsWrapped : undefined,
      getActiveOrganization: client.supportsOrganizations() ? getActiveOrganizationWrapped : undefined,
      setActiveOrganization: client.supportsOrganizations() ? setActiveOrganizationWrapped : undefined,
      organizations,
      activeOrganization,
      supportsOrganizations: client.supportsOrganizations(),
    }),
    [
      authState, 
      client, 
      flowEngine, 
      flowState, 
      dispatch, 
      nextFlow, 
      backFlow, 
      cancelFlow, 
      resetFlow,
      isFlowLoading,
      completeUIComponents,
      completeRendererConfig,
      getOrganizationsWrapped,
      getActiveOrganizationWrapped,
      setActiveOrganizationWrapped,
      organizations,
      activeOrganization,
    ]
  );

  // Create FlowContext value for AuthFlow compatibility
  const flowContextValue = useMemo<FlowContextValue | null>(() => {
    if (!flowEngine || !flowState) {
      return null;
    }
    
    return {
      engine: flowEngine,
      state: flowState,
      dispatch,
      next: nextFlow,
      back: backFlow,
      cancel: cancelFlow,
      reset: resetFlow,
      canGoBack: flowEngine.canGoBack(),
      currentStep: flowState.currentStep,
      isLoading: isFlowLoading,
      uiComponents: completeUIComponents,
      rendererConfig: completeRendererConfig,
    };
  }, [
    flowEngine,
    flowState,
    dispatch,
    nextFlow,
    backFlow,
    cancelFlow,
    resetFlow,
    isFlowLoading,
    completeUIComponents,
    completeRendererConfig,
  ]);

  return (
    <AuthReactContext.Provider value={value}>
      {flowContextValue ? (
        <FlowContext.Provider value={flowContextValue}>
          {children}
        </FlowContext.Provider>
      ) : (
        children
      )}
    </AuthReactContext.Provider>
  );
}


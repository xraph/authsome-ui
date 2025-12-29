/**
 * Email/Password authentication renderer
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks';
import type { UIComponents } from '../ui-components';
import type { RendererConfig } from '../renderer-config';
import { DEFAULT_BUILTIN_FIELD_ORDER } from '../renderer-config';
import type { FlowState, FieldDefinition } from '@authsome/ui-core';
import { defaultLocale, AuthErrorType, FlowStep } from '@authsome/ui-core';

/**
 * Get callback URL from URL search params (client-side only)
 */
function getCallbackUrlFromParams(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get('callbackUrl') || searchParams.get('redirectTo') || undefined;
}

export interface EmailPasswordRendererProps {
  state: FlowState;
  onNext: (data?: Partial<FlowState>) => Promise<void>;
  onBack?: () => Promise<void>;
  isLoading: boolean;
  uiComponents: UIComponents;
  rendererConfig?: RendererConfig;
  mode?: 'signin' | 'signup';
}

export function EmailPasswordRenderer({
  state,
  onNext,
  onBack: _onBack,
  isLoading,
  uiComponents,
  rendererConfig,
  mode = 'signin',
}: EmailPasswordRendererProps) {
  const auth = useAuth();
  const { signIn, signUp, adapter } = auth;
  const { Input, Button, Alert: AlertComponents, Field, Select, Checkbox, Textarea } = uiComponents;
  
  const config = rendererConfig || {};
  const signUpConfig = config.signUp || {};
  const signInConfig = config.signIn || {};
  const locale = config.locale || defaultLocale;

  // Capture callbackUrl from URL params on mount (for redirect after auth)
  const callbackUrl = useMemo(() => getCallbackUrlFromParams(), []);
  
  // Destructure Alert composite components
  const { Alert, AlertDescription } = AlertComponents || {};

  const [email, setEmail] = useState(state.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dynamicFields, setDynamicFields] = useState<FieldDefinition[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

  // Fetch dynamic fields on mount for signup
  useEffect(() => {
    const fetchFields = async () => {
      if (mode === 'signup' && adapter?.getSignupFields) {
        try {
          const fields = await adapter.getSignupFields();
          setDynamicFields(fields);
          
          // Initialize dynamic values with default values (including nested fields in groups)
          const initialValues: Record<string, any> = {};
          const initializeFieldValues = (fieldList: FieldDefinition[]) => {
            fieldList.forEach(field => {
              if (field.type === 'group' && field.fields) {
                initializeFieldValues(field.fields);
              } else if (field.defaultValue !== undefined) {
                initialValues[field.name] = field.defaultValue;
              }
            });
          };
          initializeFieldValues(fields);
          setDynamicValues(initialValues);
        } catch (err) {
          console.error('Failed to fetch signup fields:', err);
        }
      }
    };
    fetchFields();
  }, [mode, adapter]);

  // Validate a single dynamic field
  const validateSingleField = (field: FieldDefinition): string | null => {
    const value = dynamicValues[field.name];
    const validation = field.validation;

    if (!validation) return null;

    // Required validation
    if (validation.required && (value === undefined || value === '' || value === null)) {
      return validation.errorMessage || `${field.label} is required`;
    }

    // Skip other validations if value is empty and not required
    if (value === undefined || value === '' || value === null) return null;

    // String length validations
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        return validation.errorMessage || `${field.label} must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return validation.errorMessage || `${field.label} must be at most ${validation.maxLength} characters`;
      }
    }

    // Number validations
    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        return validation.errorMessage || `${field.label} must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && value > validation.max) {
        return validation.errorMessage || `${field.label} must be at most ${validation.max}`;
      }
    }

    // Pattern validation
    if (validation.pattern && typeof value === 'string') {
      try {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return validation.errorMessage || `${field.label} format is invalid`;
        }
      } catch (e) {
        console.error('Invalid regex pattern:', validation.pattern);
      }
    }

    return null;
  };

  // Validate dynamic fields
  const validateDynamicFields = (): string | null => {
    for (const field of dynamicFields) {
      // Handle group type - validate nested fields
      if (field.type === 'group' && field.fields) {
        for (const nestedField of field.fields) {
          const error = validateSingleField(nestedField);
          if (error) return error;
        }
        continue;
      }

      const error = validateSingleField(field);
      if (error) return error;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate dynamic fields
    if (mode === 'signup') {
      const dynamicFieldError = validateDynamicFields();
      if (dynamicFieldError) {
        setError(dynamicFieldError);
        return;
      }
    }

    if (!signIn || !signUp) {
      setError('Authentication is not available');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn({ email, password });
      } else {
        await signUp({ 
          email, 
          password,
          ...dynamicValues, // Include dynamic field values
        });
      }

      // Auth state is updated internally, just move to next step
      // Include callbackUrl in metadata for redirect after flow completes
      setLoading(false);
      await onNext({ 
        email,
        metadata: { ...state.metadata, callbackUrl },
      });
    } catch (err: any) {
      setLoading(false);
      
      // Check if this is an EMAIL_NOT_VERIFIED error - navigate to verification flow
      if (err.type === AuthErrorType.EMAIL_NOT_VERIFIED) {
        // Navigate to verification step with email context and error details
        // Explicitly set the currentStep to trigger the email verification flow
        await onNext({ 
          currentStep: FlowStep.EMAIL_VERIFICATION_REQUIRED,
          email,
          error: err,
          metadata: { 
            ...state.metadata, 
            callbackUrl,
            requiresVerification: true,
          },
        });
        return; // Don't show inline error, user is being navigated to verification
      }
      
      // For other errors, display inline with detailed error message
      const errorMessage = err.message || err.toString() || `${mode === 'signin' ? 'Sign in' : 'Sign up'} failed`;
      console.error(`[Auth Error] ${mode} failed:`, err);
      setError(errorMessage);
    }
  };

  // Render a single dynamic field (used for both regular fields and group nested fields)
  const renderSingleField = (field: FieldDefinition, keyPrefix = 'dynamic') => {
    const value = dynamicValues[field.name];
    const handleChange = (newValue: any) => {
      setDynamicValues(prev => ({ ...prev, [field.name]: newValue }));
    };

    const fieldId = `${keyPrefix}-${field.name}`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'password':
      case 'number':
      case 'date':
        return (
          <Field.Field key={field.name} className="flex-1 min-w-0">
            <Field.FieldLabel htmlFor={fieldId}>
              {field.label}
              {field.validation?.required && ' *'}
            </Field.FieldLabel>
            <Input
              id={fieldId}
              type={field.type}
              value={value || ''}
              onChange={(e) => handleChange(field.type === 'number' ? parseFloat(e.target.value) : e.target.value)}
              placeholder={field.placeholder}
              required={field.validation?.required}
              disabled={loading || isLoading}
              minLength={field.validation?.minLength}
              maxLength={field.validation?.maxLength}
              min={field.validation?.min}
              max={field.validation?.max}
            />
            {field.helperText && (
              <Field.FieldDescription>{field.helperText}</Field.FieldDescription>
            )}
          </Field.Field>
        );

      case 'textarea':
        if (!Textarea) return null;
        return (
          <Field.Field key={field.name} className="flex-1 min-w-0">
            <Field.FieldLabel htmlFor={fieldId}>
              {field.label}
              {field.validation?.required && ' *'}
            </Field.FieldLabel>
            <Textarea
              id={fieldId}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              required={field.validation?.required}
              disabled={loading || isLoading}
            />
            {field.helperText && (
              <Field.FieldDescription>{field.helperText}</Field.FieldDescription>
            )}
          </Field.Field>
        );

      case 'select':
        if (!Select || !field.options) return null;
        return (
          <Field.Field key={field.name} className="flex-1 min-w-0">
            <Field.FieldLabel htmlFor={fieldId}>
              {field.label}
              {field.validation?.required && ' *'}
            </Field.FieldLabel>
            <Select.Root
              value={value || ''}
              onValueChange={handleChange}
              disabled={loading || isLoading}
            >
              <Select.Trigger id={fieldId}>
                <Select.Value placeholder={field.placeholder || 'Select...'} />
              </Select.Trigger>
              <Select.Content>
                {field.options.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {field.helperText && (
              <Field.FieldDescription>{field.helperText}</Field.FieldDescription>
            )}
          </Field.Field>
        );

      case 'checkbox':
        if (!Checkbox) return null;
        return (
          <Field.Field key={field.name} orientation="horizontal">
            <Checkbox
              id={fieldId}
              checked={!!value}
              onCheckedChange={handleChange}
              disabled={loading || isLoading}
              label={field.label}
              description={field.helperText}
            />
          </Field.Field>
        );

      default:
        return null;
    }
  };

  // Sort fields by order (fields with order come first, sorted ascending; fields without order come after)
  const sortFieldsByOrder = <T extends { order?: number }>(fields: T[]): T[] => {
    return [...fields].sort((a, b) => {
      // Fields with order come before fields without order
      if (a.order !== undefined && b.order === undefined) return -1;
      if (a.order === undefined && b.order !== undefined) return 1;
      // Both have order - sort ascending
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      // Neither has order - maintain original order
      return 0;
    });
  };

  // Render a dynamic field (handles groups and regular fields)
  const renderDynamicField = (field: FieldDefinition) => {
    // Handle group type - render multiple fields in a row
    if (field.type === 'group' && field.fields && field.fields.length > 0) {
      const gap = field.gap || '1rem';
      // Sort nested fields within group by order as well
      const sortedNestedFields = sortFieldsByOrder(field.fields);
      return (
        <div
          key={field.name}
          className="flex flex-row items-start"
          style={{ gap }}
        >
          {sortedNestedFields.map((nestedField) => renderSingleField(nestedField, `group-${field.name}`))}
        </div>
      );
    }

    return renderSingleField(field);
  };

  // Get built-in field order with defaults
  const builtInFieldOrder = useMemo(() => ({
    ...DEFAULT_BUILTIN_FIELD_ORDER,
    ...signUpConfig.builtInFieldOrder,
  }), [signUpConfig.builtInFieldOrder]);

  // Type for unified signup form items
  type SignupFormItem =
    | { itemType: 'email'; order: number }
    | { itemType: 'password'; order: number }
    | { itemType: 'confirmPassword'; order: number }
    | { itemType: 'dynamic'; field: FieldDefinition; order: number };

  // Build unified sorted list of signup form items
  const signupFormItems = useMemo((): SignupFormItem[] => {
    if (mode !== 'signup') return [];

    const items: SignupFormItem[] = [];

    // Add built-in fields with their configured order
    items.push({ itemType: 'email', order: builtInFieldOrder.email });
    items.push({ itemType: 'password', order: builtInFieldOrder.password });
    items.push({ itemType: 'confirmPassword', order: builtInFieldOrder.confirmPassword });

    // Add dynamic fields
    dynamicFields.forEach((field) => {
      const order = field.order ?? Infinity;
      items.push({ itemType: 'dynamic', field, order });
    });

    // Sort all items by order
    return items.sort((a, b) => {
      if (a.order === Infinity && b.order === Infinity) return 0;
      if (a.order === Infinity) return 1;
      if (b.order === Infinity) return -1;
      return a.order - b.order;
    });
  }, [mode, builtInFieldOrder, dynamicFields]);

  // Render email field (built-in)
  const renderEmailField = () => (
    <Field.Field key="builtin-email">
      <Field.FieldLabel htmlFor="email">{locale.auth?.email || 'Email'}</Field.FieldLabel>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="john@example.com"
        required
        disabled={loading || isLoading}
        aria-invalid={!!error}
      />
    </Field.Field>
  );

  // Render password field (built-in)
  const renderPasswordField = () => (
    <Field.Field key="builtin-password">
      <Field.FieldLabel htmlFor="password">{locale.auth?.password || 'Password'}</Field.FieldLabel>
      <Input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        disabled={loading || isLoading}
        aria-invalid={!!error}
      />
      {mode === 'signup' && (
        <Field.FieldDescription>At least 8 characters</Field.FieldDescription>
      )}
    </Field.Field>
  );

  // Render confirm password field (built-in, signup only)
  const renderConfirmPasswordField = () => (
    <Field.Field key="builtin-confirmPassword">
      <Field.FieldLabel htmlFor="confirmPassword">{locale.auth?.confirmPassword || 'Confirm Password'}</Field.FieldLabel>
      <Input
        id="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        required
        disabled={loading || isLoading}
        aria-invalid={!!error}
      />
    </Field.Field>
  );

  // Render unified signup form fields (sorted by order)
  const renderSignupFormFields = () => {
    return signupFormItems.map((item) => {
      switch (item.itemType) {
        case 'email':
          return renderEmailField();
        case 'password':
          return renderPasswordField();
        case 'confirmPassword':
          return renderConfirmPasswordField();
        case 'dynamic':
          return renderDynamicField(item.field);
        default:
          return null;
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {mode === 'signin'
            ? 'Enter your email and password to sign in'
            : 'Enter your details to create a new account'}
        </p>
      </div>

      {error && Alert && AlertDescription && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sign-in mode: simple email + password */}
        {mode === 'signin' && (
          <>
            <Field.Field>
              <Field.FieldLabel htmlFor="email">{locale.auth?.email || 'Email'}</Field.FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                disabled={loading || isLoading}
                aria-invalid={!!error}
              />
            </Field.Field>

            <Field.Field>
              <Field.FieldLabel htmlFor="password">{locale.auth?.password || 'Password'}</Field.FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading || isLoading}
                aria-invalid={!!error}
              />
            </Field.Field>
          </>
        )}

        {/* Sign-up mode: unified field ordering (email, dynamic, password, confirmPassword) */}
        {mode === 'signup' && renderSignupFormFields()}

        <Button
          type="submit"
          loading={loading || isLoading}
          className="w-full"
        >
          {mode === 'signin' ? (locale.auth?.signIn || 'Sign In') : (locale.signUp?.title || 'Create Account')}
        </Button>
      </form>

      {/* Sign-in/Sign-up link */}
      {mode === 'signin' && signInConfig.showSignUpLink !== false && (
        <p className="text-center text-sm text-gray-600">
          {locale.signIn?.noAccount || "Don't have an account?"}{' '}
          <a 
            href={signInConfig.signUpUrl || '/auth/signup'} 
            className="font-medium text-primary hover:underline"
          >
            {locale.signIn?.signUpLink || locale.auth?.signUp || 'Sign up'}
          </a>
        </p>
      )}
      {mode === 'signup' && signUpConfig.showSignInLink !== false && (
        <p className="text-center text-sm text-gray-600">
          {locale.signUp?.haveAccount || 'Already have an account?'}{' '}
          <a 
            href={signUpConfig.signInUrl || '/auth/signin'} 
            className="font-medium text-primary hover:underline"
          >
            {locale.signUp?.signInLink || locale.auth?.signIn || 'Sign in'}
          </a>
        </p>
      )}
    </div>
  );
}

/**
 * UI Component types for flow renderers
 * 
 * Users can pass their own components (like shadcn) to customize the look
 */

import type { ReactNode, ComponentType, InputHTMLAttributes, ButtonHTMLAttributes } from 'react';

/**
 * Input component props
 * Note: Use Field components for labels, errors, and helper text
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Labels, errors, and helper text are now handled by Field components
}

/**
 * Button component props
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  icon?: ReactNode;
}

/**
 * Card component props
 */
export interface CardProps {
  children: ReactNode;
  className?: string;
}

/**
 * Alert/Message component props
 */
export interface AlertProps {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  children: ReactNode;
  className?: string;
}

/**
 * Divider component props
 */
export interface DividerProps {
  label?: string;
  className?: string;
}

/**
 * Link component props
 */
export interface LinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Checkbox component props
 * Supports both native HTML checkbox and Radix UI / shadcn patterns
 */
export interface CheckboxProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

/**
 * Label component props
 */
export interface LabelProps {
  children: ReactNode;
  required?: boolean;
  className?: string;
  htmlFor?: string;
}

/**
 * Shadcn-style composite Select components
 * Supports Radix UI / shadcn pattern with separate subcomponents
 */
export interface SelectComponents {
  Root: ComponentType<any>;
  Trigger: ComponentType<any>;
  Value: ComponentType<any>;
  Content: ComponentType<any>;
  Item: ComponentType<any>;
  Group?: ComponentType<any>;
  Label?: ComponentType<any>;
}

/**
 * Select component props for UnifiedAuthRenderer
 */
export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string; group?: string }>;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Textarea component props
 */
export interface TextareaProps {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  className?: string;
  id?: string;
}

/**
 * Field components for form structure (shadcn Field pattern)
 */
export interface FieldComponents {
  Field: ComponentType<any>;
  FieldLabel: ComponentType<any>;
  FieldDescription: ComponentType<any>;
  FieldError: ComponentType<any>;
  FieldSet?: ComponentType<any>;
  FieldLegend?: ComponentType<any>;
  FieldGroup?: ComponentType<any>;
}

/**
 * Complete UI component collection
 */
export interface UIComponents {
  // Form components (required)
  Input: ComponentType<InputProps>;
  Button: ComponentType<ButtonProps>;
  Field: FieldComponents;
  
  // Layout components
  Card?: ComponentType<CardProps>;
  Alert?: ComponentType<AlertProps>;
  Divider?: ComponentType<DividerProps>;
  Link?: ComponentType<LinkProps>;
  Checkbox?: ComponentType<CheckboxProps>;
  Label?: ComponentType<LabelProps>;
  Select?: SelectComponents; // Composite select (shadcn-style)
  Textarea?: ComponentType<TextareaProps>;
  
  // Icons (optional - will use default if not provided)
  icons?: {
    loading?: ComponentType<{ className?: string }>;
    success?: ComponentType<{ className?: string }>;
    error?: ComponentType<{ className?: string }>;
    mail?: ComponentType<{ className?: string }>;
    phone?: ComponentType<{ className?: string }>;
    key?: ComponentType<{ className?: string }>;
    shield?: ComponentType<{ className?: string }>;
    user?: ComponentType<{ className?: string }>;
    passkey?: ComponentType<{ className?: string }>;
    magicLink?: ComponentType<{ className?: string }>;
  };
  
  // OAuth provider icons (optional)
  providerIcons?: Record<string, ComponentType<{ className?: string }>>;
}

/**
 * Required UI components
 */
export const REQUIRED_COMPONENTS: (keyof UIComponents)[] = ['Input', 'Button', 'Field'];

/**
 * Validate UI components
 */
export function validateUIComponents(components: Partial<UIComponents>): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required components
  for (const key of REQUIRED_COMPONENTS) {
    if (!components[key]) {
      missing.push(key);
    }
  }

  // Check optional but recommended components
  const recommended: (keyof UIComponents)[] = ['Card', 'Alert', 'Divider'];
  for (const key of recommended) {
    if (!components[key]) {
      warnings.push(`Optional component '${key}' not provided. Default will be used.`);
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}


/**
 * Default UI components
 * 
 * Simple, unstyled components used as fallbacks
 */

import React from 'react';
import type { 
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
} from './ui-components';

export const DefaultInput: React.FC<InputProps> = ({ label, error, helperText, className, ...props }) => (
  <div className={`space-y-1 ${className || ''}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
    )}
    <input
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300'
      }`}
      {...props}
    />
    {error && (
      <p className="text-sm text-red-600">{error}</p>
    )}
    {helperText && !error && (
      <p className="text-sm text-gray-500">{helperText}</p>
    )}
  </div>
);

export const DefaultButton: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  loading,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-blue-600 underline-offset-4 hover:underline',
  };
  
  const sizeStyles = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export const DefaultCard: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className || ''}`}>
    {children}
  </div>
);

export const DefaultAlert: React.FC<AlertProps> = ({ variant = 'default', children, className }) => {
  const variantStyles = {
    default: 'bg-gray-50 border-gray-200 text-gray-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`p-4 border rounded-md ${variantStyles[variant]} ${className || ''}`}>
      {children}
    </div>
  );
};

export const DefaultDivider: React.FC<DividerProps> = ({ label, className }) => (
  <div className={`relative ${className || ''}`}>
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300" />
    </div>
    {label && (
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-white text-gray-500">{label}</span>
      </div>
    )}
  </div>
);

export const DefaultLink: React.FC<LinkProps> = ({ href, children, className, onClick }) => (
  <a
    href={href}
    className={`text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline ${className || ''}`}
    onClick={onClick}
  >
    {children}
  </a>
);

export const DefaultCheckbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, ...props }, ref) => (
    <div className={`flex items-start gap-2 ${className || ''}`}>
      <input 
        ref={ref} 
        type="checkbox" 
        {...props} 
        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
      />
      <div className="flex-1">
        {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  )
);
DefaultCheckbox.displayName = 'DefaultCheckbox';

export const DefaultLabel = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required, className, ...props }, ref) => (
    <label ref={ref} {...props} className={`text-sm font-medium text-gray-700 ${className || ''}`}>
      {children}
      {required && <span className="text-red-600 ml-1">*</span>}
    </label>
  )
);
DefaultLabel.displayName = 'DefaultLabel';

// Default Select using native HTML select
const DefaultSelectRoot: React.FC<any> = ({ children, value, onValueChange, ...props }) => (
  <div {...props}>
    {React.Children.map(children, child => {
      if (React.isValidElement(child) && child.type === DefaultSelectTrigger) {
        return React.cloneElement(child as React.ReactElement<any>, { value, onValueChange });
      }
      return child;
    })}
  </div>
);

const DefaultSelectTrigger: React.FC<any> = ({ children, className, value, onValueChange }) => (
  <div className={`relative ${className || ''}`}>
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  </div>
);

const DefaultSelectValue: React.FC<any> = ({ placeholder }) => (
  <option value="" disabled>{placeholder}</option>
);

const DefaultSelectContent: React.FC<any> = ({ children }) => <>{children}</>;

const DefaultSelectItem: React.FC<any> = ({ value, children }) => (
  <option value={value}>{children}</option>
);

const DefaultSelectGroup: React.FC<any> = ({ children }) => (
  <optgroup>{children}</optgroup>
);

const DefaultSelectLabel: React.FC<any> = ({ children }) => (
  <option disabled className="font-bold">{children}</option>
);

export const DefaultSelect: SelectComponents = {
  Root: DefaultSelectRoot,
  Trigger: DefaultSelectTrigger,
  Value: DefaultSelectValue,
  Content: DefaultSelectContent,
  Item: DefaultSelectItem,
  Group: DefaultSelectGroup,
  Label: DefaultSelectLabel,
};

export const DefaultTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea 
        ref={ref} 
        {...props} 
        className={`w-full px-3 py-2 border rounded-md min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
    </div>
  )
);
DefaultTextarea.displayName = 'DefaultTextarea';


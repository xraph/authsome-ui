/**
 * Validation utilities
 */

import { ValidationError } from '../types';
import type { AuthLocale } from '../locale';
import { defaultLocale, interpolate } from '../locale/utils';

/**
 * Email regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone regex pattern (basic international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Username regex pattern (alphanumeric, underscores, hyphens, 3-30 chars)
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/;

/**
 * Validate email address
 */
export function validateEmail(email: string, locale?: AuthLocale): ValidationError | null {
  const messages = locale?.validation || defaultLocale.validation;
  
  if (!email) {
    return { field: 'email', message: messages.emailRequired };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: messages.emailInvalid };
  }

  return null;
}

/**
 * Validate password
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumber?: boolean;
    requireSpecial?: boolean;
    locale?: AuthLocale;
  } = {}
): ValidationError | null {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
    locale,
  } = options;
  
  const messages = locale?.validation || defaultLocale.validation;

  if (!password) {
    return { field: 'password', message: messages.passwordRequired };
  }

  if (password.length < minLength) {
    return {
      field: 'password',
      message: interpolate(messages.passwordTooShort, { min: minLength.toString() }),
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      field: 'password',
      message: messages.passwordRequireUppercase,
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      field: 'password',
      message: messages.passwordRequireLowercase,
    };
  }

  if (requireNumber && !/\d/.test(password)) {
    return { field: 'password', message: messages.passwordRequireNumber };
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      field: 'password',
      message: messages.passwordRequireSpecial,
    };
  }

  return null;
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string, locale?: AuthLocale): ValidationError | null {
  const messages = locale?.validation || defaultLocale.validation;
  
  if (!phone) {
    return { field: 'phone', message: messages.phoneRequired };
  }

  if (!PHONE_REGEX.test(phone)) {
    return {
      field: 'phone',
      message: messages.phoneInvalid,
    };
  }

  return null;
}

/**
 * Validate username
 */
export function validateUsername(username: string, locale?: AuthLocale): ValidationError | null {
  const messages = locale?.validation || defaultLocale.validation;
  
  if (!username) {
    return { field: 'username', message: messages.usernameRequired };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      field: 'username',
      message: messages.usernameInvalid,
    };
  }

  return null;
}

/**
 * Validate 2FA code
 */
export function validate2FACode(code: string, locale?: AuthLocale): ValidationError | null {
  const messages = locale?.validation || defaultLocale.validation;
  
  if (!code) {
    return { field: 'code', message: messages.codeRequired };
  }

  // TOTP codes are typically 6 digits
  if (!/^\d{6}$/.test(code)) {
    return { field: 'code', message: messages.codeInvalid };
  }

  return null;
}

/**
 * Validate required field
 */
export function validateRequired(
  value: unknown,
  fieldName: string,
  locale?: AuthLocale
): ValidationError | null {
  const messages = locale?.validation || defaultLocale.validation;
  
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { 
      field: fieldName, 
      message: interpolate(messages.fieldRequired, { field: fieldName }) 
    };
  }
  return null;
}


/**
 * Validation utilities
 */

import { ValidationError } from '../types';

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
export function validateEmail(email: string): ValidationError | null {
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: 'Invalid email address' };
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
  } = {}
): ValidationError | null {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options;

  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }

  if (password.length < minLength) {
    return {
      field: 'password',
      message: `Password must be at least ${minLength} characters`,
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
    };
  }

  if (requireNumber && !/\d/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one number' };
  }

  if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      field: 'password',
      message: 'Password must contain at least one special character',
    };
  }

  return null;
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationError | null {
  if (!phone) {
    return { field: 'phone', message: 'Phone number is required' };
  }

  if (!PHONE_REGEX.test(phone)) {
    return {
      field: 'phone',
      message: 'Invalid phone number. Use international format (+1234567890)',
    };
  }

  return null;
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationError | null {
  if (!username) {
    return { field: 'username', message: 'Username is required' };
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      field: 'username',
      message:
        'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens',
    };
  }

  return null;
}

/**
 * Validate 2FA code
 */
export function validate2FACode(code: string): ValidationError | null {
  if (!code) {
    return { field: 'code', message: 'Verification code is required' };
  }

  // TOTP codes are typically 6 digits
  if (!/^\d{6}$/.test(code)) {
    return { field: 'code', message: 'Code must be 6 digits' };
  }

  return null;
}

/**
 * Validate required field
 */
export function validateRequired(
  value: unknown,
  fieldName: string
): ValidationError | null {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { field: fieldName, message: `${fieldName} is required` };
  }
  return null;
}


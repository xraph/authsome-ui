import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, validatePhoneNumber, validateUsername } from '../utils/validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@example.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      expect(validatePassword('Password123!')).toBe(true);
      expect(validatePassword('MyP@ssw0rd')).toBe(true);
      expect(validatePassword('C0mpl3x!Pass')).toBe(true);
    });

    it('should reject weak passwords', () => {
      // Too short
      expect(validatePassword('Pass1!')).toBe(false);
      
      // No uppercase
      expect(validatePassword('password123!')).toBe(false);
      
      // No lowercase
      expect(validatePassword('PASSWORD123!')).toBe(false);
      
      // No number
      expect(validatePassword('Password!')).toBe(false);
      
      // No special character
      expect(validatePassword('Password123')).toBe(false);
    });

    it('should handle custom requirements', () => {
      const options = {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false,
      };

      expect(validatePassword('MyPassword12', options)).toBe(true);
      expect(validatePassword('short1A', options)).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('should accept valid phone numbers', () => {
      expect(validatePhoneNumber('+1234567890')).toBe(true);
      expect(validatePhoneNumber('+44 20 7946 0958')).toBe(true);
      expect(validatePhoneNumber('+1 (555) 123-4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('1234')).toBe(false);
      expect(validatePhoneNumber('abc')).toBe(false);
      expect(validatePhoneNumber('')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('should accept valid usernames', () => {
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('test_user')).toBe(true);
      expect(validateUsername('user-name')).toBe(true);
    });

    it('should reject invalid usernames', () => {
      // Too short
      expect(validateUsername('ab')).toBe(false);
      
      // Too long
      expect(validateUsername('a'.repeat(33))).toBe(false);
      
      // Invalid characters
      expect(validateUsername('user@name')).toBe(false);
      expect(validateUsername('user name')).toBe(false);
      
      // Starts with number
      expect(validateUsername('123user')).toBe(false);
    });

    it('should handle custom options', () => {
      const options = {
        minLength: 5,
        maxLength: 20,
        allowNumbers: true,
        allowUnderscore: true,
        allowHyphen: false,
      };

      expect(validateUsername('user_123', options)).toBe(true);
      expect(validateUsername('user-name', options)).toBe(false);
      expect(validateUsername('usr', options)).toBe(false);
    });
  });
});


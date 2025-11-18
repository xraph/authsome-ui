/**
 * Locale utility functions
 */

import type { AuthLocale, DeepPartial } from './index';
import { enLocale } from './en';

/**
 * Default locale (English)
 */
export const defaultLocale = enLocale;

/**
 * Deep merge two objects
 */
function deepMerge<T extends Record<string, any>>(target: T, source: DeepPartial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== undefined) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof result[key] === 'object' &&
        result[key] !== null
      ) {
        result[key] = deepMerge(result[key] as any, source[key] as any);
      } else {
        result[key] = source[key] as any;
      }
    }
  }
  
  return result;
}

/**
 * Create a complete locale by merging overrides with the default English locale
 * 
 * @param overrides - Partial locale object with custom translations
 * @returns Complete locale object with all required keys
 * 
 * @example
 * ```typescript
 * const spanishLocale = createLocale({
 *   auth: {
 *     signIn: 'Iniciar sesión',
 *     signUp: 'Registrarse',
 *   }
 * });
 * ```
 */
export function createLocale(overrides?: DeepPartial<AuthLocale>): AuthLocale {
  if (!overrides) {
    return defaultLocale;
  }
  
  return deepMerge(defaultLocale, overrides);
}

/**
 * Interpolate template string with values
 * 
 * Replaces {key} placeholders with corresponding values from the provided object.
 * 
 * @param template - Template string with {key} placeholders
 * @param values - Object with key-value pairs for interpolation
 * @returns Interpolated string
 * 
 * @example
 * ```typescript
 * interpolate('Hello, {name}!', { name: 'John' })
 * // Returns: "Hello, John!"
 * 
 * interpolate('Password must be at least {min} characters', { min: '8' })
 * // Returns: "Password must be at least 8 characters"
 * ```
 */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}

/**
 * Get a nested property from an object using dot notation
 * 
 * @param obj - Object to search
 * @param path - Dot-notation path (e.g., 'auth.signIn')
 * @returns Value at path or undefined
 */
export function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}


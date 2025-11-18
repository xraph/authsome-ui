/**
 * @authsome/ui-core
 * 
 * Framework-agnostic authentication core
 */

// Export types
export * from './types';

// Export utilities
export * from './utils';

// Export locale
export type { AuthLocale, DeepPartial } from './locale';
export { defaultLocale, createLocale, interpolate } from './locale/utils';

// Export adapters
export * from './adapters';

// Export client
export * from './client';

// Re-export commonly used items for convenience
export { AuthClient } from './client';

// Export flows
export * from './flows';


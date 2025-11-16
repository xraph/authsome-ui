/**
 * @authsome/ui-react-shadcn
 * 
 * A CLI tool to add authentication components to your project.
 * Follows the shadcn/ui philosophy: copy-paste, not install.
 * 
 * Usage:
 *   npx authsome-ui init              # Initialize in your project
 *   npx authsome-ui add <component>   # Add specific component
 *   npx authsome-ui add --all         # Add all components
 *   npx authsome-ui list              # List available components
 * 
 * This package doesn't export React components.
 * Instead, it copies component code directly into your project,
 * giving you full control over styling and behavior.
 */

export const version = '0.1.0';

// Export types for component templates
export type { ComponentConfig } from './config/components';
export { COMPONENTS } from './config/components';

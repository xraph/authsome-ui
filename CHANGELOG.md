# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Core (`@authsome/ui-core`)
- Framework-agnostic authentication client
- Provider interface for extensible auth backends
- Built-in adapters: AuthSome, Supabase, Clerk, Generic
- Comprehensive type system
- State management with observer pattern
- Token refresh mechanism
- Validation utilities
- Custom error classes
- Security utilities (CSRF protection, token handling)

#### React (`@authsome-ui/react`)
- `AuthProvider` context provider
- Core hooks: `useAuth`, `useUser`, `useSession`
- Flow-specific hooks: `useSignIn`, `useSignUp`, `useSignOut`
- Advanced hooks: `useOAuth`, `useMagicLink`, `use2FA`, `usePasskey`, `usePhoneAuth`, `useUsernameAuth`
- Route protection: `RequireAuth` component and `withAuth` HOC
- Programmatic auth check with `useRequireAuth`

#### React Headless (`@authsome-ui/react-headless`)
- Headless components using render props pattern
- `SignInForm`, `SignUpForm` with full state management
- `OAuthButtons` for social authentication
- `MagicLinkForm` for passwordless auth
- `TwoFactorForm` and `TwoFactorSetup` for 2FA
- `PhoneAuthForm` for SMS verification
- `UsernameAuthForm` for username-based auth
- `PasskeyPrompt` for biometric auth
- `AuthModal` and `AuthTabs` for composite flows
- `ProfileMenu` and `SessionList` for user management

#### React ShadCN (`@authsome-ui/react-shadcn`)
- Pre-styled components using shadcn/ui
- Beautiful, production-ready forms
- Dark mode support
- Responsive design
- Tailwind CSS integration
- All headless components with shadcn/ui styling

#### Demo Application
- Next.js 14 App Router demo
- Interactive playground for all components
- Example pages for each auth flow
- Protected dashboard
- Provider switching demonstration
- Complete code examples

#### Documentation
- Getting Started guide
- Comprehensive API reference
- Architecture documentation
- Contributing guidelines
- Component documentation
- Hook reference
- Type system documentation

#### Testing
- Unit tests for core functionality
- React hooks tests
- Component integration tests
- Test utilities and mocks
- Vitest configuration

#### Tooling
- Monorepo setup with Turborepo
- pnpm workspaces
- TypeScript strict mode
- ESLint and Prettier
- tsup for building
- Vitest for testing

### Authentication Flows Supported
- ✅ Email/Password authentication
- ✅ OAuth (Google, GitHub, Microsoft, Facebook, Apple, Twitter, Discord, Slack)
- ✅ Magic link (passwordless email)
- ✅ Two-factor authentication (TOTP, SMS, Email)
- ✅ Phone number authentication
- ✅ Username-based authentication
- ✅ Passkeys/WebAuthn

### Security Features
- CSRF protection for OAuth flows
- Secure token storage
- XSS prevention
- Input validation
- Rate limiting support
- Error handling best practices

## [0.1.0] - 2025-01-XX (Initial Release)

### Added
- Initial release of AuthSome UI
- Core packages: core, react, react-headless, react-shadcn
- Demo application
- Documentation
- Tests
- CI/CD setup

---

## Contributors

Thank you to all contributors who have helped build AuthSome UI!

---

For more details, see the [GitHub Releases](https://github.com/xraph/authsome-ui/releases) page.


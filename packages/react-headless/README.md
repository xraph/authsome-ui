# @authsome/ui-react-headless

Unstyled, accessible React components for AuthSome UI.

## Installation

```bash
pnpm add @authsome/ui-react-headless @authsome/ui-react @authsome/ui-core
```

## Features

- **Headless Components**: Bring your own styles
- **Render Props Pattern**: Maximum flexibility
- **Type Safe**: Full TypeScript support
- **Accessible**: Built with accessibility in mind
- **Validation Built-in**: Form validation included

## Usage

All components use the render props pattern, giving you complete control over rendering.

### SignInForm

```tsx
import { SignInForm } from '@authsome/ui-react-headless';

function MySignInForm() {
  return (
    <SignInForm onSuccess={() => console.log('Success!')}>
      {({
        email,
        password,
        isLoading,
        error,
        validationErrors,
        setEmail,
        setPassword,
        handleSubmit,
      }) => (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          {validationErrors.email && <span>{validationErrors.email}</span>}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          {validationErrors.password && <span>{validationErrors.password}</span>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {error && <div>{error.message}</div>}
        </form>
      )}
    </SignInForm>
  );
}
```

### SignUpForm

```tsx
import { SignUpForm } from '@authsome/ui-react-headless';

function MySignUpForm() {
  return (
    <SignUpForm>
      {({
        email,
        password,
        confirmPassword,
        name,
        setEmail,
        setPassword,
        setConfirmPassword,
        setName,
        handleSubmit,
        isLoading,
        validationErrors,
      }) => (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          {validationErrors.email && <span>{validationErrors.email}</span>}
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          {validationErrors.password && <span>{validationErrors.password}</span>}
          
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
          />
          {validationErrors.confirmPassword && (
            <span>{validationErrors.confirmPassword}</span>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      )}
    </SignUpForm>
  );
}
```

### OAuthButtons

```tsx
import { OAuthButtons } from '@authsome/ui-react-headless';

function MyOAuthButtons() {
  return (
    <OAuthButtons redirectUri="/dashboard">
      {({ providers, signIn, isLoading }) => (
        <div>
          {providers.map((provider) => (
            <button
              key={provider}
              onClick={() => signIn(provider)}
              disabled={isLoading}
            >
              Sign in with {provider}
            </button>
          ))}
        </div>
      )}
    </OAuthButtons>
  );
}
```

### MagicLinkForm

```tsx
import { MagicLinkForm } from '@authsome/ui-react-headless';

function MyMagicLinkForm() {
  return (
    <MagicLinkForm>
      {({ email, setEmail, handleSubmit, isLoading, isSent }) => (
        <form onSubmit={handleSubmit}>
          {isSent ? (
            <p>Check your email for the magic link!</p>
          ) : (
            <>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <button type="submit" disabled={isLoading}>
                Send Magic Link
              </button>
            </>
          )}
        </form>
      )}
    </MagicLinkForm>
  );
}
```

### TwoFactorForm

```tsx
import { TwoFactorForm } from '@authsome/ui-react-headless';

function My2FAForm() {
  return (
    <TwoFactorForm>
      {({ code, setCode, remember, setRemember, handleSubmit, isLoading }) => (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            maxLength={6}
          />
          
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            Remember this device
          </label>

          <button type="submit" disabled={isLoading}>
            Verify
          </button>
        </form>
      )}
    </TwoFactorForm>
  );
}
```

### AuthTabs

```tsx
import { AuthTabs, SignInForm, SignUpForm } from '@authsome/ui-react-headless';

function MyAuthTabs() {
  return (
    <AuthTabs>
      {({ activeTab, setActiveTab, isSignIn, isSignUp }) => (
        <div>
          <div>
            <button
              onClick={() => setActiveTab('signin')}
              aria-selected={isSignIn}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              aria-selected={isSignUp}
            >
              Sign Up
            </button>
          </div>

          {isSignIn && <SignInForm>{/* ... */}</SignInForm>}
          {isSignUp && <SignUpForm>{/* ... */}</SignUpForm>}
        </div>
      )}
    </AuthTabs>
  );
}
```

### ProfileMenu

```tsx
import { ProfileMenu } from '@authsome/ui-react-headless';

function MyProfileMenu() {
  return (
    <ProfileMenu>
      {({ user, isOpen, toggle, signOut, isSigningOut }) => (
        <div>
          <button onClick={toggle}>
            {user?.name || user?.email}
          </button>
          
          {isOpen && (
            <div>
              <div>Signed in as {user?.email}</div>
              <button onClick={signOut} disabled={isSigningOut}>
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      )}
    </ProfileMenu>
  );
}
```

## Available Components

- `SignInForm` - Email/password sign in
- `SignUpForm` - User registration
- `OAuthButtons` - OAuth provider buttons
- `MagicLinkForm` - Passwordless authentication
- `TwoFactorForm` - 2FA verification
- `TwoFactorSetup` - 2FA setup
- `PhoneAuthForm` - Phone authentication
- `UsernameAuthForm` - Username-based auth
- `PasskeyPrompt` - Passkey registration/auth
- `AuthModal` - Modal wrapper
- `AuthTabs` - Tabbed sign in/up interface
- `ProfileMenu` - User profile menu
- `SessionList` - Session management

## License

MIT
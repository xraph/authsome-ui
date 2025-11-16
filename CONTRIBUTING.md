# Contributing to AuthSome UI

Thank you for your interest in contributing to AuthSome UI! This document provides guidelines and instructions for contributing.

## Development Setup

### Prerequisites

- Node.js 18+ and pnpm 8+
- Git

### Getting Started

1. Fork and clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/authsome-ui.git
cd authsome-ui
```

2. Install dependencies:
```bash
pnpm install
```

3. Build all packages:
```bash
pnpm build
```

4. Run the demo app:
```bash
cd apps/demo
pnpm dev
```

## Project Structure

```
authsome-ui/
├── packages/
│   ├── core/              # Framework-agnostic core
│   ├── react/             # React bindings
│   ├── react-headless/    # Headless React components
│   └── react-shadcn/      # Styled components
├── apps/
│   └── demo/              # Demo application
├── turbo.json             # Turborepo configuration
└── pnpm-workspace.yaml    # pnpm workspace configuration
```

## Development Workflow

### Building

Build all packages:
```bash
pnpm build
```

Build specific package:
```bash
pnpm --filter @authsome/ui-core build
```

### Testing

Run all tests:
```bash
pnpm test
```

Run tests for specific package:
```bash
pnpm --filter @authsome/ui-core test
```

Watch mode:
```bash
pnpm --filter @authsome/ui-core test:watch
```

### Linting

Lint all packages:
```bash
pnpm lint
```

Fix linting issues:
```bash
pnpm lint:fix
```

### Type Checking

```bash
pnpm type-check
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes

- Write clean, self-documenting code
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run tests
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint

# Build to ensure no errors
pnpm build
```

### 4. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint. Your commits must follow this format:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

#### Commit Format

**Type** (required): Must be one of:
- `feat`: New feature (triggers minor version bump)
- `fix`: Bug fix (triggers patch version bump)
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semi-colons, etc)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `build`: Changes to build system or external dependencies
- `ci`: Changes to CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

**Scope** (optional but recommended): Package or area affected:
- `core` - @authsome/ui-core
- `react` - @authsome/ui-react
- `react-headless` - @authsome/ui-react-headless
- `react-shadcn` - @authsome/ui-react-shadcn
- `adapter-authsome` - @authsome/adapter-authsome
- `adapter-clerk` - @authsome/adapter-clerk
- `adapter-generic` - @authsome/adapter-generic
- `adapter-supabase` - @authsome/adapter-supabase
- `deps` - Dependency updates
- `config` - Configuration changes
- `docs` - Documentation updates
- `demo` - Demo app changes
- `monorepo` - Monorepo-wide changes

**Subject** (required): Brief description (max 100 chars)
- Use lowercase (except proper nouns)
- No period at the end
- Imperative mood ("add" not "added" or "adds")

#### Examples

```bash
# Feature with scope
git commit -m "feat(core): add passwordless authentication flow"

# Bug fix with scope
git commit -m "fix(react): resolve infinite loop in useAuth hook"

# Documentation update
git commit -m "docs(react-shadcn): add installation instructions"

# Breaking change (triggers major version bump in 1.x+)
git commit -m "feat(core)!: redesign adapter interface

BREAKING CHANGE: AuthProvider now requires async initialization"

# Multi-line commit
git commit -m "refactor(react-headless): simplify form component logic

- Extract validation logic to separate function
- Remove unused state variables
- Improve TypeScript types"
```

#### Breaking Changes

To indicate a breaking change:
1. Add `!` after the type/scope: `feat(core)!:`
2. Add `BREAKING CHANGE:` in the footer with migration details

#### Using Commitizen (Optional)

For an interactive commit helper:
```bash
pnpm commit
```

This will guide you through creating a properly formatted commit.

#### Commit Message Validation

Commits are validated automatically via git hooks (husky + commitlint). Invalid commits will be rejected with an error message explaining what's wrong.

### 5. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a pull request on GitHub.

## Pull Request Guidelines

### PR Title

Use conventional commit format:
```
feat(package): brief description
```

### PR Description

Include:
- **What**: Brief description of changes
- **Why**: Reason for the changes
- **How**: Implementation approach (if complex)
- **Testing**: How you tested the changes
- **Breaking Changes**: Any breaking changes (if applicable)

### PR Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Types updated (if applicable)
- [ ] All tests passing
- [ ] Lint checks passing
- [ ] Build successful
- [ ] No breaking changes (or clearly documented)

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` if type is truly unknown

```typescript
// Good
interface User {
  id: string;
  email: string;
}

async function getUser(id: string): Promise<User> {
  // ...
}

// Avoid
function getUser(id) {
  // ...
}
```

### React

- Use functional components
- Use hooks for state and side effects
- Keep components focused and single-purpose
- Extract complex logic into custom hooks

```typescript
// Good
function MyComponent({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  
  // ...
}

// Avoid
function MyComponent(props: any) {
  // ...
}
```

### Naming Conventions

- **Files**: Use PascalCase for components, camelCase for utilities
- **Components**: PascalCase
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

## Testing Guidelines

### Unit Tests

- Test public APIs, not implementation details
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert

```typescript
describe('AuthClient', () => {
  it('should sign in user with valid credentials', async () => {
    // Arrange
    const client = new AuthClient({ provider: mockProvider });
    
    // Act
    const result = await client.signIn({ email, password });
    
    // Assert
    expect(result.user).toBeDefined();
  });
});
```

### Integration Tests

- Test component interactions
- Mock external dependencies
- Test user flows, not implementation

## Adding New Features

### New Auth Provider

1. Create adapter in `packages/core/src/adapters/`
2. Implement `AuthProvider` interface
3. Add tests
4. Update documentation
5. Add example to demo app

### New Component

1. Create headless version in `packages/react-headless/src/components/`
2. Create styled version in `packages/react-shadcn/src/components/`
3. Add tests for both versions
4. Update documentation
5. Add example to demo app

### New Hook

1. Create hook in `packages/react/src/hooks/`
2. Add tests
3. Update documentation
4. Add example to demo app

## Documentation

### Code Comments

- Use JSDoc for public APIs
- Explain "why", not "what"
- Keep comments up to date

```typescript
/**
 * Signs in a user with email and password
 * 
 * @param credentials - User credentials
 * @returns Promise resolving to authenticated user and session
 * @throws AuthError if credentials are invalid
 */
async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
  // ...
}
```

### README Updates

Update relevant README files when:
- Adding new features
- Changing APIs
- Updating dependencies
- Changing project structure

## Release Process

Releases are automated using [Release Please](https://github.com/googleapis/release-please) based on conventional commits.

### How It Works

1. **Conventional Commits**: When you commit with conventional format, release-please tracks them
2. **Release PR**: On merge to `main`, release-please creates/updates a release PR
3. **Version Bumping**: The PR includes version bumps based on commit types:
   - `feat`: Minor version bump (0.1.0 → 0.2.0)
   - `fix`: Patch version bump (0.1.0 → 0.1.1)
   - `feat!` or `BREAKING CHANGE`: Major version bump (0.1.0 → 1.0.0, once out of 0.x)
4. **Changelog**: CHANGELOG.md is automatically generated from commits
5. **Independent Versioning**: Each package has its own version and changelog

### Release PR Workflow

When you merge changes to `main`:

1. Release-please analyzes conventional commits
2. Creates or updates a "Release PR" with:
   - Updated version numbers in package.json
   - Generated CHANGELOG.md entries
   - Git tags for each package
3. Maintainers review and merge the release PR
4. Maintainers manually publish to npm when ready

### For Maintainers

To publish after merging the release PR:

```bash
# Build all packages
pnpm build --filter=./packages/*

# Publish each package (must be authenticated with npm)
cd packages/core && npm publish --access public
cd packages/react && npm publish --access public
# ... and so on
```

Or use the automated publish workflow (when enabled in GitHub Actions).

## Getting Help

- **Issues**: Check existing issues or create new one
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community (link in README)

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Give constructive feedback
- Focus on the issue, not the person

## Recognition

Contributors are recognized in:
- CHANGELOG.md for their contributions
- README.md contributors section
- GitHub contributors page

Thank you for contributing to AuthSome UI! 🚀


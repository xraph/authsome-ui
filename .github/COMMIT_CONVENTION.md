# Commit Message Convention

This repository follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Quick Reference

### Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description | Version Bump |
|------|-------------|--------------|
| `feat` | New feature | Minor (0.x.0) |
| `fix` | Bug fix | Patch (0.0.x) |
| `docs` | Documentation only | None |
| `style` | Code style (formatting) | None |
| `refactor` | Code refactoring | None |
| `perf` | Performance improvement | Patch |
| `test` | Tests only | None |
| `build` | Build system changes | None |
| `ci` | CI configuration | None |
| `chore` | Other changes | None |
| `revert` | Revert previous commit | None |

### Scopes

Package scopes:
- `core` - @authsome/ui-core
- `react` - @authsome/ui-react
- `react-headless` - @authsome/ui-react-headless
- `react-shadcn` - @authsome/ui-react-shadcn
- `adapter-authsome` - @authsome/adapter-authsome
- `adapter-clerk` - @authsome/adapter-clerk
- `adapter-generic` - @authsome/adapter-generic
- `adapter-supabase` - @authsome/adapter-supabase

General scopes:
- `deps` - Dependency updates
- `config` - Configuration changes
- `docs` - Documentation
- `demo` - Demo app
- `monorepo` - Monorepo-wide changes

## Examples

### Features
```bash
git commit -m "feat(core): add passwordless authentication"
git commit -m "feat(react): implement usePasskey hook"
git commit -m "feat(react-shadcn): add biometric login component"
```

### Bug Fixes
```bash
git commit -m "fix(react): resolve hook dependency array issue"
git commit -m "fix(adapter-clerk): handle token refresh correctly"
```

### Breaking Changes
```bash
git commit -m "feat(core)!: redesign adapter interface

BREAKING CHANGE: AuthProvider.init() is now async.

Migration:
- Change: const provider = new Provider(config)
- To: const provider = await Provider.create(config)"
```

### Documentation
```bash
git commit -m "docs(react): update useAuth hook examples"
git commit -m "docs: add migration guide for v2"
```

### Multi-line Commits
```bash
git commit -m "refactor(react-headless): simplify SignInForm component

- Extract validation logic to useFormValidation hook
- Remove duplicate state management
- Improve TypeScript types for better DX

Closes #123"
```

## Subject Guidelines

- Use imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter (except proper nouns)
- No period (.) at the end
- Maximum 100 characters

## Body Guidelines

- Separate from subject with blank line
- Wrap at 100 characters per line
- Explain what and why, not how
- Use bullet points for multiple changes

## Footer Guidelines

- Reference issues: `Closes #123` or `Fixes #456`
- Breaking changes: `BREAKING CHANGE: description`
- Co-authors: `Co-authored-by: Name <email>`

## Validation

Commits are automatically validated using:
- **commitlint**: Enforces conventional commit format
- **husky**: Git hooks for pre-commit validation

Invalid commits will be rejected with helpful error messages.

## Interactive Mode

Use Commitizen for guided commits:

```bash
pnpm commit
```

This will prompt you for:
1. Type of change
2. Scope (optional)
3. Short description
4. Longer description (optional)
5. Breaking changes (if any)
6. Issues closed (if any)

## Release Impact

Your commit messages determine version bumps:

| Commit | Current: 0.1.0 | After Release |
|--------|----------------|---------------|
| `fix:` | 0.1.0 | 0.1.1 |
| `feat:` | 0.1.0 | 0.2.0 |
| `feat!:` or `BREAKING CHANGE:` | 0.1.0 | 1.0.0* |

*Note: Breaking changes bump major version only after 1.0.0 release. Before 1.0.0, they bump minor version.

## Tips

1. **Keep commits atomic**: One logical change per commit
2. **Write clear subjects**: Should complete the sentence "This commit will..."
3. **Use body for context**: Explain why, not what (code shows what)
4. **Reference issues**: Link to GitHub issues for traceability
5. **Test before commit**: Ensure build and tests pass

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)


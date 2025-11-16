# GitHub Configuration

This directory contains GitHub-specific configuration for the AuthSome UI project.

## Workflows

### release-please.yml

Automated release management workflow that:
- Triggers on push to `main` branch
- Analyzes conventional commits
- Creates/updates release PRs
- Manages version bumps and changelogs
- Supports independent package versioning

**Trigger**: Push to `main`  
**Actions**: Creates release PRs based on conventional commits

## Documentation

### COMMIT_CONVENTION.md

Quick reference guide for conventional commit format:
- Commit types and their meanings
- Scope definitions for monorepo packages
- Examples of properly formatted commits
- Breaking change syntax
- Multi-line commit format

## Usage

### For Contributors

When making commits:
1. Follow conventional commit format: `type(scope): subject`
2. Use valid commit types (feat, fix, docs, etc.)
3. Include scope when modifying specific packages
4. Commits are validated automatically via git hooks

### For Maintainers

When managing releases:
1. Review release PRs created by Release Please
2. Verify changelog entries are accurate
3. Merge release PR when ready
4. Manually publish packages to npm

## Files in This Directory

- `workflows/release-please.yml` - Automated release workflow
- `COMMIT_CONVENTION.md` - Commit message guidelines
- `README.md` - This file

## Related Documentation

- `/CONVENTIONAL_COMMITS_SETUP.md` - Full setup documentation
- `/CONTRIBUTING.md` - Contribution guidelines
- `/SETUP_COMPLETE.md` - Setup completion checklist
- `/commitlint.config.js` - Commit validation rules
- `/release-please-config.json` - Release configuration

## Maintenance

The GitHub workflows and configurations should be reviewed:
- When adding new packages to the monorepo
- When changing versioning strategy
- When updating CI/CD requirements
- Periodically for GitHub Actions updates


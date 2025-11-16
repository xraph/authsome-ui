module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum - standard conventional commit types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only changes
        'style',    // Code style changes (formatting, missing semi-colons, etc)
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvement
        'test',     // Adding or correcting tests
        'build',    // Changes to build system or external dependencies
        'ci',       // Changes to CI configuration files and scripts
        'chore',    // Other changes that don't modify src or test files
        'revert',   // Reverts a previous commit
      ],
    ],
    // Scope validation - allow package names and common scopes
    'scope-enum': [
      2,
      'always',
      [
        // Package scopes
        'core',
        'react',
        'react-headless',
        'react-shadcn',
        'adapter-authsome',
        'adapter-clerk',
        'adapter-generic',
        'adapter-supabase',
        // Common scopes
        'deps',
        'release',
        'config',
        'docs',
        'demo',
        'monorepo',
      ],
    ],
    // Allow empty scope for commits that affect multiple packages
    'scope-empty': [0],
    // Subject rules
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 100],
    // Body rules
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],
    // Footer rules
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
};


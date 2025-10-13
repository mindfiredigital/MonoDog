module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation changes
        'style', // Code style changes (formatting, etc)
        'refactor', // Code refactoring
        'perf', // Performance improvements
        'test', // Adding or updating tests
        'chore', // Maintenance tasks
        'ci', // CI/CD changes
        'build', // Build system changes
        'revert', // Reverting changes
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'dashboard', // Dashboard app
        'server', // Backend server
        'shared', // Shared utilities
        'config', // Configuration files
        'deps', // Dependencies
        'release', // Release related
        'docs', // Documentation
      ],
    ],
    'subject-max-length': [2, 'always', 100],
    'subject-min-length': [2, 'always', 10],
    'header-max-length': [2, 'always', 120],
  },
};

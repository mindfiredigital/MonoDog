/**
 * @fileoverview Configuration file for linting this package itself.
 * This allows the 'npm run lint' command to pass inside packages/eslint-config.
 */

// Apply the shared configuration to this package's root files
export default [
  {
    files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
    rules: {
      // Can add specific rules for this config file if needed
    },
  },
];

import { execSync } from 'child_process';
import fs from 'fs';

// Get the most recent commit message
const commitMessage = execSync('git log -1 --format=%s').toString().trim();

// Define valid scopes
const validScopes = [
  'monodog'
];

// Define regex patterns
const commitPatterns = {
  major:  /^(feat|fix)\(([^)]+)\)!: (.+)/,   // e.g., feat(scope)!: message
  minor: /^feat\(([^)]+)\): (.+)/, // Matches "feat(package-name): description" (without the "!" indicator)
  patch: /^fix\(([^)]+)\): (.+)/,  // Matches "fix(package-name): description" (without the "!" indicator)
};

// Identify type, package, and description
let packageScope = null;
let changeType = null;
let description = null;

    // 1. Check for Major Change using the "!" subject indicator
if (commitPatterns.major.test(commitMessage)) {
  const scope = commitMessage.match(commitPatterns.major)?.[2];
  if (validScopes.includes(scope)) {
    changeType = 'major';
    packageScope = scope;
    description = commitMessage.match(commitPatterns.major)?.[3];
  }
} else if (commitPatterns.minor.test(commitMessage)) {
  const scope = commitMessage.match(commitPatterns.minor)?.[1];
  if (validScopes.includes(scope)) {
    changeType = 'minor';
    packageScope = scope;
    description = commitMessage.match(commitPatterns.minor)?.[2];
  }
} else if (commitPatterns.patch.test(commitMessage)) {
  const scope = commitMessage.match(commitPatterns.patch)?.[1];
  if (validScopes.includes(scope)) {
    changeType = 'patch';
    packageScope = scope;
    description = commitMessage.match(commitPatterns.patch)?.[2];
  }
}

// Generate and write changeset if valid package found
if (packageScope) {
  packageScope = packageScope.trim();
  description = description?.trim() || 'No description provided.';

  // Determine the full package name based on scope
  const packageName =
 `@mindfiredigital/${packageScope}`;

  // Generate changeset content
  const changesetContent = `---
  '${packageName}': ${changeType}
  ---
  ${description}
  `;

  // Write to a changeset file
  fs.writeFileSync(`.changeset/auto-${Date.now()}.md`, changesetContent);
  console.log(`✅ Changeset file created for package: ${packageName}`);
} else {
  console.log(
    '⚠️ No valid package scope found in commit message. Valid scopes are: monodog'
  );
}

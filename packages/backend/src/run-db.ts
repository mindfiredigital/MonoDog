import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';
import path from 'node:path';

try {
  const compiledUrlPath = path.join(__dirname, '..', 'dist', 'get-db-url.js');
  const sourceUrlPath = path.join(__dirname, 'get-db-url.ts');

  const getDbUrlCommand = existsSync(compiledUrlPath)
    ? `node "${compiledUrlPath}"`
    : `tsx "${sourceUrlPath}"`;

  const dbUrl = execSync(getDbUrlCommand, {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'],
  }).trim();

  // Get the command from CLI arguments
  const command = process.argv.slice(2).join(' ');

  if (!command) {
    console.error('No command provided to run-db.ts');
    process.exit(1);
  }

  // Execute with DATABASE_URL injected
  execSync(command, {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: dbUrl,
    },
  });
} catch (err) {
  process.exit(1);
}

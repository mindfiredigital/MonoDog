import { execSync } from 'node:child_process';
import process from 'node:process';

try {
  const dbUrl = execSync('node dist/get-db-url.js', {
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

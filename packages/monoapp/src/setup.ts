#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('\nInitializing Monodog...\n');

const cwd = process.cwd();
const destinationPath = path.join(cwd, 'monodog');
const packageRoot = path.resolve(__dirname, '..');

if (fs.existsSync(destinationPath)) {
  console.log('monodog already exists.');
  process.exit(0);
}
if (fs.existsSync(path.join(cwd, 'pnpm-workspace.yaml'))) {
  console.log('Workspace detected, installing monodog as standalone app.');
}

// 1. Copy package
console.log('Copying Monodog...');
fs.cpSync(packageRoot, destinationPath, {
  recursive: true,
  dereference: true,
  filter: (src) => {
    const name = path.basename(src);
    return ![
      'node_modules',
      '.git',
      '.turbo',
      '.pnpm',
      '.cache',
      'dist/.tsbuildinfo',
    ].includes(name);
  },
});

// 2. Fix package.json (standalone app)
fixPackageJson(destinationPath);

function ensureWorkspace(rootDir: string) {
  const wsPath = path.join(rootDir, 'pnpm-workspace.yaml');
  if (!fs.existsSync(wsPath)) {console.log('pnpm-workspace.yaml does not exist'); return;}

  const content = fs.readFileSync(wsPath, 'utf8');
  if (content.includes('monodog')) return;

  const updated = content.replace(
    /packages:\s*\n/,
    `packages:\n  - monodog\n`
  );

  fs.writeFileSync(wsPath, updated);
}
// 3. Install deps
ensureWorkspace(process.cwd());
execSync('pnpm install', { stdio: 'inherit' });
execSync('pnpm --filter monodog-app  migrate:reset', { stdio: 'inherit' });

console.log(`
Monodog ready!

Next:
  cd monodog
  pnpm serve
`);

function fixPackageJson(appDir: string) {
  const pkgPath = path.join(appDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  pkg.private = true;               // critical REQUIRED
  pkg.name = 'monodog-app';         // avoid workspace collision
  delete pkg.bin;                   // this is now an app, not a CLI

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

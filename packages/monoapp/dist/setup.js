#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
console.log('\nInitializing Monodog...\n');
const cwd = process.cwd();
const destinationPath = path_1.default.join(cwd, 'monodog');
const packageRoot = path_1.default.resolve(__dirname, '..');
if (fs_1.default.existsSync(destinationPath)) {
    console.log('monodog already exists.');
    process.exit(0);
}
if (fs_1.default.existsSync(path_1.default.join(cwd, 'pnpm-workspace.yaml'))) {
    console.log('Workspace detected, installing monodog as standalone app.');
}
// 1. Copy package
console.log('Copying Monodog...');
fs_1.default.cpSync(packageRoot, destinationPath, {
    recursive: true,
    dereference: true,
    filter: (src) => {
        const name = path_1.default.basename(src);
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
function ensureWorkspace(rootDir) {
    const wsPath = path_1.default.join(rootDir, 'pnpm-workspace.yaml');
    if (!fs_1.default.existsSync(wsPath)) {
        console.log('pnpm-workspace.yaml does not exist');
        return;
    }
    const content = fs_1.default.readFileSync(wsPath, 'utf8');
    if (content.includes('monodog'))
        return;
    const updated = content.replace(/packages:\s*\n/, `packages:\n  - monodog\n`);
    fs_1.default.writeFileSync(wsPath, updated);
}
// 3. Install deps
ensureWorkspace(process.cwd());
(0, child_process_1.execSync)('pnpm install', { stdio: 'inherit' });
(0, child_process_1.execSync)('pnpm --filter monodog-app  migrate:reset', { stdio: 'inherit' });
console.log(`
Monodog ready!

Next:
  cd monodog
  pnpm serve
`);
function fixPackageJson(appDir) {
    const pkgPath = path_1.default.join(appDir, 'package.json');
    const pkg = JSON.parse(fs_1.default.readFileSync(pkgPath, 'utf8'));
    pkg.private = true; // critical REQUIRED
    pkg.name = 'monodog-app'; // avoid workspace collision
    delete pkg.bin; // this is now an app, not a CLI
    fs_1.default.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

import fs from 'fs';
import path from 'path';

/**
 * Find the monorepo root by looking for package.json with workspaces or pnpm-workspace.yaml
 */
export function findMonorepoRoot(): string {
  let currentDir = __dirname;

  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    const pnpmWorkspacePath = path.join(currentDir, 'pnpm-workspace.yaml');

    // Check if this directory has package.json with workspaces or pnpm-workspace.yaml
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8')
        );
        // If it has workspaces or is the root monorepo package
        if (packageJson.workspaces || fs.existsSync(pnpmWorkspacePath)) {
          return currentDir;
        }
      } catch (error) {
        // Continue searching if package.json is invalid
      }
    }

    // Check if we're at the git root
    const gitPath = path.join(currentDir, '.git');
    if (fs.existsSync(gitPath)) {
      return currentDir;
    }

    // Go up one directory
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // Prevent infinite loop
    currentDir = parentDir;
  }

  return process.cwd();
}

export function getFileType(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'js':
      return 'javascript';
    case 'ts':
      return 'typescript';
    case 'env':
      return 'env';
    case 'md':
      return 'markdown';
    case 'cjs':
      return 'javascript';
    case 'config':
      return 'text';
    case 'example':
      return filename.includes('.env') ? 'env' : 'text';
    default:
      return 'text';
  }
}

export function containsSecrets(content: string, filename: string): boolean {
  if (!filename.includes('.env') && !filename.includes('config')) {
    return false;
  }

  const secretPatterns = [
    /password\s*=\s*[^\s]/i,
    /secret\s*=\s*[^\s]/i,
    /key\s*=\s*[^\s]/i,
    /token\s*=\s*[^\s]/i,
    /auth\s*=\s*[^\s]/i,
    /credential\s*=\s*[^\s]/i,
    /api_key\s*=\s*[^\s]/i,
    /private_key\s*=\s*[^\s]/i,
    /DATABASE_URL/i,
    /JWT_SECRET/i,
    /GITHUB_TOKEN/i,
  ];

  return secretPatterns.some(pattern => pattern.test(content));
}

// Helper function to scan for configuration files
export async function scanConfigFiles(rootDir: string): Promise<any[]> {
  const configPatterns = [
    // Root level config files
    'package.json',
    'pnpm-workspace.yaml',
    'pnpm-lock.yaml',
    'turbo.json',
    'tsconfig.json',
    '.eslintrc.*',
    '.prettierrc',
    '.prettierignore',
    '.editorconfig',
    '.nvmrc',
    '.gitignore',
    'commitlint.config.js',
    '.releaserc.json',
    'env.example',

    // App-specific config files
    'vite.config.*',
    'tailwind.config.*',
    'postcss.config.*',
    'components.json',

    // Package-specific config files
    'jest.config.*',
    '.env*',
    'dockerfile*',
  ];

  const configFiles: any[] = [];
  const scannedPaths = new Set();

  function scanDirectory(dir: string, depth = 0) {
    if (scannedPaths.has(dir) || depth > 8) return; // Limit depth for safety
    scannedPaths.add(dir);

    try {
      const items = fs.readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
          // Skip node_modules and other non-source directories
          if (!shouldSkipDirectory(item.name, depth)) {
            scanDirectory(fullPath, depth + 1);
          }
        } else {
          // Check if file matches config patterns
          if (isConfigFile(item.name)) {
            try {
              const stats = fs.statSync(fullPath);
              const content = fs.readFileSync(fullPath, 'utf8');
              const relativePath =
                fullPath.replace(rootDir, '').replace(/\\/g, '/') ||
                `/${item.name}`;

              configFiles.push({
                id: relativePath,
                name: item.name,
                path: relativePath,
                type: getFileType(item.name),
                content: content,
                size: stats.size,
                lastModified: stats.mtime.toISOString(),
                hasSecrets: containsSecrets(content, item.name),
              });
            } catch (error) {
              console.warn(`Could not read file: ${fullPath}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Could not scan directory: ${dir}`);
    }
  }

  function shouldSkipDirectory(dirName: string, depth: number): boolean {
    const skipDirs = [
      'node_modules',
      'dist',
      'build',
      '.git',
      '.next',
      '.vscode',
      '.turbo',
      '.husky',
      '.github',
      '.vite',
      'migrations',
      'coverage',
      '.cache',
      'tmp',
      'temp',
    ];

    // At root level, be more permissive
    if (depth === 0) {
      return skipDirs.includes(dirName);
    }

    // Deeper levels, skip more directories
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  function isConfigFile(filename: string): boolean {
    return configPatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(filename.toLowerCase());
      }
      return filename.toLowerCase() === pattern.toLowerCase();
    });
  }

  // Start scanning from root
  scanDirectory(rootDir);

  // Sort files by path for consistent ordering
  configFiles.sort((a, b) => a.path.localeCompare(b.path));

  return configFiles;
}

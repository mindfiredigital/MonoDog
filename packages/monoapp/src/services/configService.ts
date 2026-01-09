import fs from 'fs';
import path from 'path';

import * as PrismaPkg from '@prisma/client';
const PrismaClient = (PrismaPkg as any).PrismaClient || (PrismaPkg as any).default || PrismaPkg;
const prisma = new PrismaClient();

// Helper function to scan for configuration files
async function scanConfigFiles(rootDir: string): Promise<any[]> {
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

  console.log(`🔍 Scanning for config files in: ${rootDir}`);

  // Start scanning from root
  scanDirectory(rootDir);

  // Sort files by path for consistent ordering
  configFiles.sort((a, b) => a.path.localeCompare(b.path));

  console.log(`📁 Found ${configFiles.length} configuration files`);

  // Log some sample files for debugging
  if (configFiles.length > 0) {
    console.log('Sample config files found:');
    configFiles.slice(0, 5).forEach(file => {
      console.log(`  - ${file.path} (${file.type})`);
    });
    if (configFiles.length > 5) {
      console.log(`  ... and ${configFiles.length - 5} more`);
    }
  }

  return configFiles;
}

function containsSecrets(content: string, filename: string): boolean {
  // Only check .env files and files that might contain secrets
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

function getFileType(filename: string): string {
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

export const getConfigurationFilesService = async (rootDir: string) => {

  const configFiles = await scanConfigFiles(rootDir);

  // Transform to match frontend ConfigFile interface
  const transformedFiles = configFiles.map(file => ({
    id: file.id,
    name: file.name,
    path: file.path,
    type: file.type,
    content: file.content,
    size: file.size,
    lastModified: file.lastModified,
    hasSecrets: file.hasSecrets,
    isEditable: true,
  }));

  return {
    success: true,
    files: transformedFiles,
    total: transformedFiles.length,
    timestamp: Date.now(),
  };
}

export const updateConfigFileService = async (id: string, rootDir: string, content: string) => {
  const filePath = path.join(
    rootDir,
    id.startsWith('/') ? id.slice(1) : id
  );

  console.log('💾 Saving file:', filePath);
  console.log('📁 Root directory:', rootDir);

  // Security check: ensure the file is within the project directory
  if (!filePath.startsWith(rootDir)) {
    throw new Error('Invalid file path');
  }

  // Check if file exists and is writable
  try {
    await fs.promises.access(filePath, fs.constants.W_OK);
  } catch (error) {
    throw new Error('File is not writable or does not exist ' + filePath);
  }
  // Write the new content
  await fs.promises.writeFile(filePath, content, 'utf8');

  // Get file stats for updated information
  const stats = await fs.promises.stat(filePath);
  const filename = path.basename(filePath);

  const updatedFile = {
    id: id,
    name: filename,
    path: id,
    type: getFileType(filename),
    content: content,
    size: stats.size,
    lastModified: stats.mtime.toISOString(),
    hasSecrets: containsSecrets(content, filename),
    isEditable: true,
  };

  return {
    success: true,
    file: updatedFile,
    message: 'File saved successfully',
  };
}

export const updatePackageConfigurationService = async (packagePath: string, packageName: string, config: string) => {
  let newConfig;
  try {
    newConfig = JSON.parse(config);
  } catch (error) {
    console.error('JSON parsing error:', error);
    throw new Error('Invalid JSON format: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

  const packageJsonPath = path.join(packagePath, 'package.json');

  // Security check: ensure the path is valid
  if (!fs.existsSync(packagePath)) {
    throw new Error('Package directory not found: ' + packagePath);
  }

  // Check if package.json exists
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found in directory: ' + packageJsonPath);
  }

  // Read the existing package.json to preserve all fields
  const existingContent = await fs.promises.readFile(packageJsonPath, 'utf8');
  let existingConfig;
  try {
    existingConfig = JSON.parse(existingContent);
  } catch (error) {
    throw new Error('Failed to parse existing package.json: ' + (error instanceof Error ? error.message : 'Invalid JSON'));
  }

  // Merge the new configuration with existing configuration
  const mergedConfig = {
    ...existingConfig,
    name: newConfig.name || existingConfig.name,
    version: newConfig.version || existingConfig.version,
    description:
      newConfig.description !== undefined
        ? newConfig.description
        : existingConfig.description,
    license:
      newConfig.license !== undefined
        ? newConfig.license
        : existingConfig.license,
    repository: newConfig.repository || existingConfig.repository,
    scripts: newConfig.scripts || existingConfig.scripts,
    dependencies: newConfig.dependencies || existingConfig.dependencies,
    devDependencies:
      newConfig.devDependencies || existingConfig.devDependencies,
    peerDependencies:
      newConfig.peerDependencies || existingConfig.peerDependencies,
  };

  // Write the merged configuration back
  const formattedConfig = JSON.stringify(mergedConfig, null, 2);
  await fs.promises.writeFile(packageJsonPath, formattedConfig, 'utf8');

  // Update the package in the database - use correct field names based on your Prisma schema
  const updateData: any = {
    lastUpdated: new Date(),
  };

  // Only update fields that exist in your Prisma schema
  if (newConfig.version) updateData.version = newConfig.version;
  if (newConfig.description !== undefined)
    updateData.description = newConfig.description || '';
  if (newConfig.license !== undefined)
    updateData.license = newConfig.license || '';
  if (newConfig.scripts)
    updateData.scripts = JSON.stringify(newConfig.scripts);
  if (newConfig.repository)
    updateData.repository = JSON.stringify(newConfig.repository);
  if (newConfig.dependencies)
    updateData.dependencies = JSON.stringify(newConfig.dependencies);
  if (newConfig.devDependencies)
    updateData.devDependencies = JSON.stringify(newConfig.devDependencies);
  if (newConfig.peerDependencies)
    updateData.peerDependencies = JSON.stringify(newConfig.peerDependencies);

  console.log('📝 Updating database with:', updateData);

  const updatedPackage = await prisma.package.update({
    where: { name: packageName },
    data: updateData,
  });

  // Transform the response
  const transformedPackage = {
    ...updatedPackage,
    maintainers: updatedPackage.maintainers
      ? JSON.parse(updatedPackage.maintainers)
      : [],
    scripts: updatedPackage.scripts ? JSON.parse(updatedPackage.scripts) : {},
    repository: updatedPackage.repository
      ? JSON.parse(updatedPackage.repository)
      : {},
    dependencies: updatedPackage.dependencies
      ? JSON.parse(updatedPackage.dependencies)
      : {},
    devDependencies: updatedPackage.devDependencies
      ? JSON.parse(updatedPackage.devDependencies)
      : {},
    peerDependencies: updatedPackage.peerDependencies
      ? JSON.parse(updatedPackage.peerDependencies)
      : {},
  };
  return transformedPackage;
}

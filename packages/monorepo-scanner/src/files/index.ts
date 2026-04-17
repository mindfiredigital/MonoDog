import fs from 'fs';
import path from 'path';
import { scanMonorepo } from '@monodog/utils/helpers';

export function scanForFileTypes(
  rootDir: string,
  fileTypes: string[]
): Record<string, string[]> {
  const results: Record<string, string[]> = {};

  for (const fileType of fileTypes) {
    results[fileType] = [];
  }

  const packages = scanMonorepo(rootDir);

  for (const pkg of packages) {
    scanPackageForFiles(pkg.path, fileTypes, results);
  }

  return results;
}

export function scanPackageForFiles(
  packagePath: string,
  fileTypes: string[],
  results: Record<string, string[]>
): void {
  try {
    const items = fs.readdirSync(packagePath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(packagePath, item.name);

      if (item.isDirectory()) {
        if (!['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
          scanPackageForFiles(fullPath, fileTypes, results);
        }
      } else {
        const ext = path.extname(item.name);
        if (fileTypes.includes(ext)) {
          results[ext].push(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
}

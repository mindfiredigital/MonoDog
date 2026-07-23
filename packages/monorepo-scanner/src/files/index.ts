import fs from 'fs';
import path from 'path';
import { scanMonorepo } from '@mindfiredigital/utils/helpers';

export async function scanForFileTypes(
  rootDir: string,
  fileTypes: string[]
): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};

  for (const fileType of fileTypes) {
    results[fileType] = [];
  }

  const packages = await scanMonorepo(rootDir);

  const promises = packages.map(pkg =>
    scanPackageForFiles(pkg.path, fileTypes, results)
  );
  await Promise.all(promises);

  return results;
}

export async function scanPackageForFiles(
  packagePath: string,
  fileTypes: string[],
  results: Record<string, string[]>
): Promise<void> {
  try {
    const items = await fs.promises.readdir(packagePath, {
      withFileTypes: true,
    });

    const promises = items.map(async item => {
      const fullPath = path.join(packagePath, item.name);

      if (item.isDirectory()) {
        if (!['node_modules', 'dist', 'build', '.git'].includes(item.name)) {
          await scanPackageForFiles(fullPath, fileTypes, results);
        }
      } else {
        const ext = path.extname(item.name);
        if (fileTypes.includes(ext)) {
          results[ext].push(fullPath);
        }
      }
    });

    await Promise.all(promises);
  } catch (error) {
    // Skip directories we can't read
  }
}

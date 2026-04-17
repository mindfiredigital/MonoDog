import path from 'path';
import fs from 'fs';
import { prisma } from '../db/prisma';
import { scanMonorepo } from '@monodog/utils/helpers';
import { storePackage } from '../utils/helpers';
import { generateReports } from '@monodog/monorepo-scanner';
import { ciStatusManager } from '@monodog/ci-status';
import { PackageRepository } from '../repositories';
import { AppLogger } from '../middleware';
import type { PackageModel } from '../types/database';

const transformPackage = (pkg: any) => {
  return {
    ...pkg,
    maintainers: pkg.maintainers ? JSON.parse(pkg.maintainers) : [],
    scripts: pkg.scripts ? JSON.parse(pkg.scripts) : {},
    repository: pkg.repository ? JSON.parse(pkg.repository) : {},
    dependencies: pkg.dependencies ? JSON.parse(pkg.dependencies) : [],
    devDependencies: pkg.devDependencies ? JSON.parse(pkg.devDependencies) : [],
    peerDependencies: pkg.peerDependencies
      ? JSON.parse(pkg.peerDependencies)
      : [],
  };
};

export const getAllPackages = async (rootPath?: string) => {
  const resolvedRootPath = rootPath || process.cwd();

  let dbPackages = await prisma.package.findMany();

  if (!dbPackages.length) {
    const rootDir = path.resolve(resolvedRootPath);
    const packages = scanMonorepo(rootDir);

    for (const pkg of packages) {
      await storePackage(pkg);
    }

    dbPackages = await prisma.package.findMany();
  }

  return dbPackages.map(transformPackage);
};

export const getPackagesService = async (rootPath: string) => {
  let dbPackages = await PackageRepository.findAll();
  if (!dbPackages.length) {
    try {
      const rootDir = rootPath;
      AppLogger.debug('rootDir: ' + rootDir);
      const packages = scanMonorepo(rootDir);
      AppLogger.debug('packages scanned: ' + packages.length);
      for (const pkg of packages) {
        await storePackage(pkg);
      }
    } catch (error) {
      throw new Error('Error ' + error);
    }
    dbPackages = await PackageRepository.findAll();
  }
  const transformedPackages = dbPackages.map((pkg: PackageModel) => {
    // We create a new object 'transformedPkg' based on the database record 'pkg'
    const transformedPkg = { ...pkg };

    // 1. Maintainers
    transformedPkg.maintainers = pkg.maintainers
      ? JSON.parse(pkg.maintainers)
      : [];

    // 2. Scripts/repository (should default to an object, not an array)
    transformedPkg.scripts = pkg.scripts ? JSON.parse(pkg.scripts) : {};
    transformedPkg.repository = pkg.repository
      ? JSON.parse(pkg.repository)
      : {};

    // 3. Dependencies List
    transformedPkg.dependencies = pkg.dependencies
      ? JSON.parse(pkg.dependencies)
      : [];
    transformedPkg.devDependencies = pkg.devDependencies
      ? JSON.parse(pkg.devDependencies)
      : [];
    transformedPkg.peerDependencies = pkg.peerDependencies
      ? JSON.parse(pkg.peerDependencies)
      : [];
    return transformedPkg; // Return the fully transformed object
  });

  return transformedPackages;
};

export const refreshAllPackages = async (rootPath?: string) => {
  const resolvedRootPath = rootPath || process.cwd();
  const rootDir = path.resolve(resolvedRootPath);

  const packages = scanMonorepo(rootDir);

  for (const pkg of packages) {
    await storePackage(pkg);
  }

  return packages;
};

export const getPackageByName = async (name: string) => {
  const pkg = await prisma.package.findUnique({
    where: {
      name,
    },
    include: {
      dependenciesInfo: true,
      commits: true,
      packageHealth: true,
    },
  });

  if (!pkg) {
    throw new Error('Package not found');
  }

  const transformedPkg = transformPackage(pkg);

  const reports: any[] = await generateReports();
  const packageReport = reports.find((r: any) => r.package.name === name);

  return {
    ...transformedPkg,
    report: packageReport,
    ciStatus: await ciStatusManager.getPackageStatus(name),
  };
};

export const updatePackageConfig = async (
  packageName: string,
  config: string,
  packagePath: string
) => {
  if (!packageName || !config || !packagePath) {
    throw new Error(
      'Package name, configuration, and package path are required'
    );
  }

  let newConfig;

  try {
    newConfig = JSON.parse(config);
  } catch (error) {
    throw new Error(
      `JSON parsing error: ${
        error instanceof Error ? error.message : 'Invalid format'
      }`
    );
  }

  const packageJsonPath = path.join(packagePath, 'package.json');

  if (!fs.existsSync(packagePath)) {
    throw new Error('Package directory not found');
  }

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found in the specified directory');
  }

  const existingContent = await fs.promises.readFile(packageJsonPath, 'utf8');

  let existingConfig;

  try {
    existingConfig = JSON.parse(existingContent);
  } catch (error) {
    throw new Error(
      `Error parsing existing package.json: ${
        error instanceof Error ? error.message : 'Invalid JSON'
      }`
    );
  }

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

  const formattedConfig = JSON.stringify(mergedConfig, null, 2);

  await fs.promises.writeFile(packageJsonPath, formattedConfig, 'utf8');

  const updateData: any = {
    lastUpdated: new Date(),
  };

  if (newConfig.version) {
    updateData.version = newConfig.version;
  }

  if (newConfig.description !== undefined) {
    updateData.description = newConfig.description || '';
  }

  if (newConfig.license !== undefined) {
    updateData.license = newConfig.license || '';
  }

  if (newConfig.scripts) {
    updateData.scripts = JSON.stringify(newConfig.scripts);
  }

  if (newConfig.repository) {
    updateData.repository = JSON.stringify(newConfig.repository);
  }

  if (newConfig.dependencies) {
    updateData.dependencies = JSON.stringify(newConfig.dependencies);
  }

  if (newConfig.devDependencies) {
    updateData.devDependencies = JSON.stringify(newConfig.devDependencies);
  }

  if (newConfig.peerDependencies) {
    updateData.peerDependencies = JSON.stringify(newConfig.peerDependencies);
  }

  const updatedPackage = await prisma.package.update({
    where: {
      name: packageName,
    },
    data: updateData,
  });

  return {
    success: true,
    message: 'Package configuration updated successfully',
    package: transformPackage(updatedPackage),
    preservedFields: true,
  };
};

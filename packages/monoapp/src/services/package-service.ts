import { scanMonorepo } from '../utils/utilities';
import { generateReports } from '../utils/monorepo-scanner';
import { ciStatusManager } from '../utils/ci-status';
import { AppLogger } from '../middleware/logger';
import { PackageRepository, CommitRepository, DependencyRepository } from '../repositories';
import type { PackageInfo, DependencyInfo, PackageReport } from '../types';
import { getCommitsByPathService } from './commit-service';
import type { PackageModel } from '../types/database';

interface TransformedPackage {
  name: string;
  version?: string;
  type?: string;
  path?: string;
  description?: string;
  license?: string;
  repository: Record<string, unknown>;
  scripts: Record<string, unknown>;
  dependencies: Record<string, unknown>;
  devDependencies: Record<string, unknown>;
  peerDependencies: Record<string, unknown>;
  maintainers: string[];
  status?: string;
  createdAt?: Date;
  lastUpdated?: Date;
}

interface PackageDetail extends TransformedPackage {
  report?: PackageReport;
  ciStatus?: Record<string, unknown>;
}

/**
 * Get package dependencies
 */
function getPackageDependenciesInfo(pkg: PackageInfo): DependencyInfo[] {
  const allDeps: DependencyInfo[] = [];
  Object.keys(pkg.dependencies || {}).forEach(depName => {
    allDeps.push({
      name: depName,
      version: pkg.dependencies[depName],
      type: 'dependency',
      latest: '',
      outdated: false,
    });
  });
  Object.keys(pkg.devDependencies || {}).forEach(depName => {
    allDeps.push({
      name: depName,
      version: pkg.devDependencies[depName],
      type: 'devDependency',
      latest: '',
      outdated: false,
    });
  });
  Object.keys(pkg.peerDependencies || {}).forEach(depName => {
    allDeps.push({
      name: depName,
      version: pkg.peerDependencies[depName]!,
      type: 'peerDependency',
      latest: '',
      outdated: false,
    });
  });
  return allDeps;
}

/**
 * Store packages in database using repository pattern
 */
async function storePackage(pkg: PackageInfo): Promise<void> {
  try {
    // Create or update package using repository
    await PackageRepository.upsert({
      name: pkg.name,
      version: pkg.version,
      type: pkg.type,
      path: pkg.path,
      description: pkg.description,
      license: pkg.license,
      repository: pkg.repository,
      scripts: pkg.scripts,
      dependencies: pkg.dependencies,
      devDependencies: pkg.devDependencies,
      peerDependencies: pkg.peerDependencies,
      maintainers: pkg.maintainers.join(','),
      status: '',
    });

    // Store commits using repository
    const commits = await getCommitsByPathService(pkg.path ?? '');
    if (commits.length) {
      await CommitRepository.storeMany(pkg.name, commits);
    }

    // Store dependencies using repository
    const dependenciesInfo = getPackageDependenciesInfo(pkg);
    if (dependenciesInfo.length) {
      await DependencyRepository.storeMany(pkg.name, dependenciesInfo);
    }
  } catch (error) {
    AppLogger.warn(`Failed to store report for ${pkg.name}`);
  }
}

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
}

export const refreshPackagesService = async (rootPath: string) => {
  await PackageRepository.deleteAll();

  const rootDir = rootPath;
  const packages = scanMonorepo(rootDir);

  AppLogger.debug('packages count: ' + packages.length);
  for (const pkg of packages) {
    await storePackage(pkg);
  }

  // Return transformed packages like getPackagesService
  const dbPackages = await PackageRepository.findAll();
  const transformedPackages = dbPackages.map((pkg: PackageModel) => {
    const transformedPkg = { ...pkg };

    transformedPkg.maintainers = pkg.maintainers
      ? JSON.parse(pkg.maintainers)
      : [];

    transformedPkg.scripts = pkg.scripts ? JSON.parse(pkg.scripts) : {};
    transformedPkg.repository = pkg.repository
      ? JSON.parse(pkg.repository)
      : {};

    transformedPkg.dependencies = pkg.dependencies
      ? JSON.parse(pkg.dependencies)
      : [];
    transformedPkg.devDependencies = pkg.devDependencies
      ? JSON.parse(pkg.devDependencies)
      : [];
    transformedPkg.peerDependencies = pkg.peerDependencies
      ? JSON.parse(pkg.peerDependencies)
      : [];
    return transformedPkg;
  });

  return transformedPackages;
}

export const getPackageDetailService = async (name: string) => {

  const pkg = await PackageRepository.findByNameWithRelations(name);
  if (!pkg) {
    return null;
  }
  const transformedPkg = { ...pkg };

  transformedPkg.scripts = pkg.scripts ? JSON.parse(pkg.scripts) : {};
  transformedPkg.repository = pkg.repository
    ? JSON.parse(pkg.repository)
    : {};

  transformedPkg.dependencies = pkg.dependencies
    ? JSON.parse(pkg.dependencies)
    : [];
  transformedPkg.devDependencies = pkg.devDependencies
    ? JSON.parse(pkg.devDependencies)
    : [];
  transformedPkg.peerDependencies = pkg.peerDependencies
    ? JSON.parse(pkg.peerDependencies)
    : [];

  // Get additional package information
  // const reports = (await generateReports()) as unknown as PackageReport[] | undefined;
  // const packageReport = reports?.find((r: PackageReport) => r.package?.name === name);

  const result: PackageDetail = {
    ...transformedPkg,
    // report: packageReport,
    ciStatus: await ciStatusManager.getPackageStatus(name),
  };

  return result;

}

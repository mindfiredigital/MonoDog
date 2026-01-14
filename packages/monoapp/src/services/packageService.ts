import { scanMonorepo } from '../utils/utilities';
import { generateReports } from '../utils/monorepo-scanner';
import { ciStatusManager } from '../utils/ci-status';
import { storePackage } from '../utils/db-utils';
import { PackageRepository } from '../repositories';

export const getPackagesService = async (rootPath: string) => {
  let dbPackages = await PackageRepository.findAll();
  if (!dbPackages.length) {
    try {
      const rootDir = rootPath;
      console.log('rootDir -->', rootDir);
      const packages = scanMonorepo(rootDir);
      console.log('packages --> scan', packages.length);
      for (const pkg of packages) {
        await storePackage(pkg);
      }
    } catch (error) {
      throw new Error('Error ' + error);
    }
    dbPackages = await PackageRepository.findAll();
  }
  const transformedPackages = dbPackages.map((pkg: any) => {
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

  console.log('packages -->', packages.length);
  for (const pkg of packages) {
    await storePackage(pkg);
  }

  return packages;
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
  const reports: any[] = await generateReports();
  const packageReport = reports.find((r: any) => r.package.name === name);

  const result = {
    ...transformedPkg,
    report: packageReport,
    ciStatus: await ciStatusManager.getPackageStatus(name),
  };

  return result;

}

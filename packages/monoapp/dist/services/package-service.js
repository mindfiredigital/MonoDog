"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageDetailService = exports.refreshPackagesService = exports.getPackagesService = void 0;
const utilities_1 = require("../utils/utilities");
const monorepo_scanner_1 = require("../utils/monorepo-scanner");
const ci_status_1 = require("../utils/ci-status");
const repositories_1 = require("../repositories");
const commit_service_1 = require("./commit-service");
/**
 * Get package dependencies
 */
function getPackageDependenciesInfo(pkg) {
    const allDeps = [];
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
            version: pkg.peerDependencies[depName],
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
async function storePackage(pkg) {
    try {
        // Create or update package using repository
        await repositories_1.PackageRepository.upsert({
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
        const commits = await (0, commit_service_1.getCommitsByPathService)(pkg.path ?? '');
        if (commits.length) {
            await repositories_1.CommitRepository.storeMany(pkg.name, commits);
        }
        // Store dependencies using repository
        const dependenciesInfo = getPackageDependenciesInfo(pkg);
        if (dependenciesInfo.length) {
            await repositories_1.DependencyRepository.storeMany(pkg.name, dependenciesInfo);
        }
    }
    catch (error) {
        console.warn(` Failed to store report for ${pkg.name}:`, error);
    }
}
const getPackagesService = async (rootPath) => {
    let dbPackages = await repositories_1.PackageRepository.findAll();
    if (!dbPackages.length) {
        try {
            const rootDir = rootPath;
            console.log('rootDir -->', rootDir);
            const packages = (0, utilities_1.scanMonorepo)(rootDir);
            console.log('packages --> scan', packages.length);
            for (const pkg of packages) {
                await storePackage(pkg);
            }
        }
        catch (error) {
            throw new Error('Error ' + error);
        }
        dbPackages = await repositories_1.PackageRepository.findAll();
    }
    const transformedPackages = dbPackages.map((pkg) => {
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
exports.getPackagesService = getPackagesService;
const refreshPackagesService = async (rootPath) => {
    await repositories_1.PackageRepository.deleteAll();
    const rootDir = rootPath;
    const packages = (0, utilities_1.scanMonorepo)(rootDir);
    console.log('packages -->', packages.length);
    for (const pkg of packages) {
        await storePackage(pkg);
    }
    return packages;
};
exports.refreshPackagesService = refreshPackagesService;
const getPackageDetailService = async (name) => {
    const pkg = await repositories_1.PackageRepository.findByNameWithRelations(name);
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
    const reports = (await (0, monorepo_scanner_1.generateReports)());
    const packageReport = reports?.find((r) => r.package?.name === name);
    const result = {
        ...transformedPkg,
        report: packageReport,
        ciStatus: await ci_status_1.ciStatusManager.getPackageStatus(name),
    };
    return result;
};
exports.getPackageDetailService = getPackageDetailService;

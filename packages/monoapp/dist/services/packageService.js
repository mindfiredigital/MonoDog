"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageDetailService = exports.refreshPackagesService = exports.getPackagesService = void 0;
const utilities_1 = require("../utils/utilities");
const monorepo_scanner_1 = require("../utils/monorepo-scanner");
const ci_status_1 = require("../utils/ci-status");
const db_utils_1 = require("../utils/db-utils");
const repositories_1 = require("../repositories");
const getPackagesService = async (rootPath) => {
    let dbPackages = await repositories_1.PackageRepository.findAll();
    if (!dbPackages.length) {
        try {
            const rootDir = rootPath;
            console.log('rootDir -->', rootDir);
            const packages = (0, utilities_1.scanMonorepo)(rootDir);
            console.log('packages --> scan', packages.length);
            for (const pkg of packages) {
                await (0, db_utils_1.storePackage)(pkg);
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
        await (0, db_utils_1.storePackage)(pkg);
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
    const reports = await (0, monorepo_scanner_1.generateReports)();
    const packageReport = reports.find((r) => r.package.name === name);
    const result = {
        ...transformedPkg,
        report: packageReport,
        ciStatus: await ci_status_1.ciStatusManager.getPackageStatus(name),
    };
    return result;
};
exports.getPackageDetailService = getPackageDetailService;

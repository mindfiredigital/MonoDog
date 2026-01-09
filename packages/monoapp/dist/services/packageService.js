"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageDetailService = exports.refreshPackagesService = exports.getPackagesService = void 0;
const utilities_1 = require("../utils/utilities");
const monorepo_scanner_1 = require("../utils/monorepo-scanner");
const ci_status_1 = require("../utils/ci-status");
const db_utils_1 = require("../utils/db-utils");
const PrismaPkg = __importStar(require("@prisma/client"));
const PrismaClient = PrismaPkg.PrismaClient || PrismaPkg.default || PrismaPkg;
const prisma = new PrismaClient();
const getPackagesService = async (rootPath) => {
    let dbPackages = await prisma.package.findMany();
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
        dbPackages = await prisma.package.findMany();
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
    await prisma.package.deleteMany();
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
    const pkg = await prisma.package.findUnique({
        where: {
            name: name,
        },
        include: {
            dependenciesInfo: true,
            commits: true,
            packageHealth: true,
        },
    });
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

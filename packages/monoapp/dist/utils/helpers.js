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
exports.getCommits = getCommits;
exports.storePackage = storePackage;
exports.storeCommits = storeCommits;
exports.getPackageDependenciesInfo = getPackageDependenciesInfo;
exports.storeDependencies = storeDependencies;
// dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Fallback import to handle environments where PrismaClient isn't a named export
const PrismaPkg = __importStar(require("@prisma/client"));
const PrismaClient = PrismaPkg.PrismaClient || PrismaPkg.default || PrismaPkg;
// Provide a fallback reference to the Prisma namespace so errors like
// Prisma.PrismaClientKnownRequestError can be referenced safely.
const Prisma = PrismaPkg.Prisma || PrismaPkg.PrismaClient?.Prisma || PrismaPkg.default?.Prisma || PrismaPkg;
const config_loader_1 = require("../config-loader");
// Default settings
const DEFAULT_PORT = 4000;
const port = config_loader_1.appConfig.server.port ?? DEFAULT_PORT; //Default port
const host = config_loader_1.appConfig.server.host ?? 'localhost'; //Default host
const prisma = new PrismaClient();
const API_BASE = `http://${host}:${port}/api`;
async function getCommits(path) {
    const res = await fetch(API_BASE + `/commits/` + encodeURIComponent(path));
    if (!res.ok)
        throw new Error('Failed to fetch commits');
    return (await res.json());
}
async function storeCommits(packageName, commits) {
    console.log('💾 Storing commits for:' + packageName);
    // Create or update dependencies
    for (const commit of commits) {
        try {
            await prisma.commit.upsert({
                where: {
                    hash_packageName: {
                        hash: commit.hash,
                        packageName: packageName,
                    }
                },
                update: {
                    message: commit.message,
                    author: commit.author,
                    date: commit.date,
                    type: commit.type,
                },
                create: {
                    hash: commit.hash,
                    message: commit.message,
                    author: commit.author,
                    date: commit.date,
                    type: commit.type,
                    packageName: packageName,
                },
            });
        }
        catch (e) {
            const err = e;
            if (err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002') {
                // Handle unique constraint violation (e.g., commit already exists)
                console.warn(`Skipping commit: ${commit.hash} (Depenndency already exists)`);
            }
            else {
                // Handle any other unexpected errors
                console.error(`Failed to store commit: ${commit.hash}`, err);
            }
        }
    }
}
/**
 * Store packages in database
 */
async function storePackage(pkg) {
    try {
        // Create or update package
        await prisma.package.upsert({
            where: { name: pkg.name },
            update: {
                version: pkg.version,
                type: pkg.type,
                path: pkg.path,
                description: pkg.description,
                license: pkg.license,
                repository: JSON.stringify(pkg.repository),
                scripts: JSON.stringify(pkg.scripts),
                lastUpdated: new Date(),
            },
            create: {
                // Timestamps
                createdAt: new Date(),
                lastUpdated: new Date(),
                // Key Metrics and Relationships
                dependencies: JSON.stringify(pkg.dependencies), // The total number of direct dependencies (12 in your example)
                // Manual Serialization Required: Stores a JSON array string of maintainers, e.g., '["team-frontend"]'
                maintainers: pkg.maintainers.join(','),
                // Manual Serialization Required: Stores a JSON array string of tags, e.g., '["core", "ui"]'
                // Manual Serialization Required: Stores the scripts object as a JSON string
                // Example: '{"dev": "vite", "build": "tsc && vite build"}'
                scripts: JSON.stringify(pkg.scripts),
                // Dependency Lists (Manual Serialization Required)
                // Stores a JSON array string of dependencies.
                // dependenciesList: JSON.stringify(pkg.dependenciesList),
                devDependencies: JSON.stringify(pkg.devDependencies),
                peerDependencies: JSON.stringify(pkg.peerDependencies),
                name: pkg.name,
                version: pkg.version,
                type: pkg.type,
                path: pkg.path,
                description: pkg.description ?? '',
                license: pkg.license ?? '',
                repository: JSON.stringify(pkg.repository),
                status: '',
            },
        });
        const commits = await getCommits(pkg.path ?? '');
        if (commits.length) {
            await storeCommits(pkg.name, commits);
        }
        const dependenciesInfo = getPackageDependenciesInfo(pkg);
        if (dependenciesInfo.length) {
            await storeDependencies(pkg.name, dependenciesInfo);
        }
    }
    catch (error) {
        console.warn(`⚠️  Failed to store report for ${pkg.name}:`, error);
    }
}
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
 * Store dependencies in database
 */
async function storeDependencies(packageName, dependencies) {
    console.log('💾 Storing Dependencies for:' + packageName);
    // Create or update dependencies
    for (const dep of dependencies) {
        try {
            await prisma.dependencyInfo.upsert({
                where: {
                    name_packageName: {
                        // This refers to the composite unique constraint
                        name: dep.name,
                        packageName,
                    },
                },
                update: {
                    version: dep.version,
                    type: dep.type,
                    latest: dep.latest,
                    outdated: dep.outdated,
                },
                create: {
                    name: dep.name,
                    version: dep.version,
                    type: dep.type,
                    latest: dep.latest,
                    outdated: dep.outdated,
                    packageName: packageName,
                },
            });
        }
        catch (e) {
            const err = e;
            if (err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002') {
                // Handle unique constraint violation (e.g., depedency already exists)
                console.warn(`Skipping dependency: ${dep.name} (Depenndency already exists)`);
            }
            else {
                // Handle any other unexpected errors
                console.error(`Failed to store dependency: ${dep.name}`, err);
            }
        }
    }
}

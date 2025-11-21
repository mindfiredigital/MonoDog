"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommits = getCommits;
exports.storePackage = storePackage;
exports.storeCommits = storeCommits;
exports.getPackageDependenciesInfo = getPackageDependenciesInfo;
exports.storeDependencies = storeDependencies;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const API_BASE = `http://localhost:4000/api`;
async function getCommits(path) {
    const res = await fetch(API_BASE + `/commits/` + encodeURIComponent(path));
    if (!res.ok)
        throw new Error('Failed to fetch commits');
    return await res.json();
}
async function storeCommits(packageName, commits) {
    console.log('💾 Storing commits for:' + packageName);
    // Create or update dependencies
    for (const commit of commits) {
        try {
            await prisma.commit.upsert({
                where: {
                    hash: commit.hash,
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
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                // Handle unique constraint violation (e.g., commit already exists)
                console.warn(`Skipping commit: ${commit.hash} (Depenndency already exists)`);
            }
            else {
                // Handle any other unexpected errors
                console.error(`Failed to store commit: ${commit.hash}`, e);
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
            console.log('💾 Dependencies stored in database:' + dep.name);
        }
        catch (e) {
            if (e instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                e.code === 'P2002') {
                // Handle unique constraint violation (e.g., depedency already exists)
                console.warn(`Skipping dependency: ${dep.name} (Depenndency already exists)`);
            }
            else {
                // Handle any other unexpected errors
                console.error(`Failed to store dependency: ${dep.name}`, e);
            }
        }
    }
}
//# sourceMappingURL=helpers.js.map
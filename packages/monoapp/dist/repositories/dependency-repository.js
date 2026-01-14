"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyRepository = void 0;
const prisma_client_1 = require("./prisma-client");
const prisma = (0, prisma_client_1.getPrismaClient)();
const Prisma = (0, prisma_client_1.getPrismaErrors)();
/**
 * Dependency Repository - Handles all DependencyInfo-related database operations
 */
class DependencyRepository {
    /**
     * Find all dependencies for a package
     */
    static async findByPackageName(packageName) {
        return await prisma.dependencyInfo.findMany({
            where: { packageName },
        });
    }
    /**
     * Find a specific dependency
     */
    static async findByNameAndPackage(name, packageName) {
        return await prisma.dependencyInfo.findUnique({
            where: {
                name_packageName: {
                    name,
                    packageName,
                },
            },
        });
    }
    /**
     * Create or update a dependency
     */
    static async upsert(data) {
        try {
            return await prisma.dependencyInfo.upsert({
                where: {
                    name_packageName: {
                        name: data.name,
                        packageName: data.packageName,
                    },
                },
                update: {
                    version: data.version,
                    type: data.type,
                    latest: data.latest || '',
                    outdated: data.outdated ?? false,
                },
                create: {
                    name: data.name,
                    version: data.version,
                    type: data.type,
                    latest: data.latest || '',
                    outdated: data.outdated ?? false,
                    packageName: data.packageName,
                },
            });
        }
        catch (e) {
            const err = e;
            if (err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002') {
                console.warn(`Skipping dependency: ${data.name} (Dependency already exists)`);
            }
            else {
                console.error(`Failed to store dependency: ${data.name}`, err);
                throw err;
            }
        }
    }
    /**
     * Store multiple dependencies
     */
    static async storeMany(packageName, dependencies) {
        console.log('Storing Dependencies for: ' + packageName);
        for (const dep of dependencies) {
            await this.upsert({
                name: dep.name,
                version: dep.version,
                type: dep.type,
                latest: dep.latest,
                outdated: dep.outdated,
                packageName,
            });
        }
    }
    /**
     * Delete all dependencies for a package
     */
    static async deleteByPackageName(packageName) {
        return await prisma.dependencyInfo.deleteMany({
            where: { packageName },
        });
    }
}
exports.DependencyRepository = DependencyRepository;

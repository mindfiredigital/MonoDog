"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageRepository = void 0;
const prisma_client_1 = require("./prisma-client");
const prisma = (0, prisma_client_1.getPrismaClient)();
/**
 * Package Repository - Handles all Package-related database operations
 */
class PackageRepository {
    /**
     * Find all packages
     */
    static async findAll() {
        return await prisma.package.findMany();
    }
    /**
     * Find a package by name
     */
    static async findByName(name) {
        return await prisma.package.findUnique({
            where: { name },
        });
    }
    /**
     * Find a package with related data
     */
    static async findByNameWithRelations(name) {
        return await prisma.package.findUnique({
            where: { name },
            include: {
                dependenciesInfo: true,
                commits: true,
                packageHealth: true,
            },
        });
    }
    /**
     * Create or update a package
     */
    static async upsert(data) {
        const createData = {
            createdAt: new Date(),
            lastUpdated: new Date(),
            dependencies: JSON.stringify(data.dependencies || {}),
            maintainers: typeof data.maintainers === 'string' ? data.maintainers : '',
            scripts: JSON.stringify(data.scripts || {}),
            devDependencies: JSON.stringify(data.devDependencies || {}),
            peerDependencies: JSON.stringify(data.peerDependencies || {}),
            name: data.name,
            version: data.version || '',
            type: data.type || '',
            path: data.path || '',
            description: data.description || '',
            license: data.license || '',
            repository: JSON.stringify(data.repository || {}),
            status: data.status || '',
        };
        const updateData = {
            version: data.version,
            type: data.type,
            path: data.path,
            description: data.description,
            license: data.license,
            repository: JSON.stringify(data.repository || {}),
            scripts: JSON.stringify(data.scripts || {}),
            lastUpdated: new Date(),
        };
        return await prisma.package.upsert({
            where: { name: data.name },
            create: createData,
            update: updateData,
        });
    }
    /**
     * Update package status
     */
    static async updateStatus(name, status) {
        return await prisma.package.update({
            where: { name },
            data: { status },
        });
    }
    /**
     * Update package configuration
     */
    static async updateConfig(name, updateData) {
        const data = {
            lastUpdated: new Date(),
        };
        if (updateData.version)
            data.version = updateData.version;
        if (updateData.description !== undefined)
            data.description = updateData.description || '';
        if (updateData.license !== undefined)
            data.license = updateData.license || '';
        if (updateData.scripts)
            data.scripts = JSON.stringify(updateData.scripts);
        if (updateData.repository)
            data.repository = JSON.stringify(updateData.repository);
        if (updateData.dependencies)
            data.dependencies = JSON.stringify(updateData.dependencies);
        if (updateData.devDependencies)
            data.devDependencies = JSON.stringify(updateData.devDependencies);
        if (updateData.peerDependencies)
            data.peerDependencies = JSON.stringify(updateData.peerDependencies);
        return await prisma.package.update({
            where: { name },
            data,
        });
    }
    /**
     * Delete all packages
     */
    static async deleteAll() {
        return await prisma.package.deleteMany();
    }
    /**
     * Delete a package by name
     */
    static async deleteByName(name) {
        return await prisma.package.delete({
            where: { name },
        });
    }
}
exports.PackageRepository = PackageRepository;

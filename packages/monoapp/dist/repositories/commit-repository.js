"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommitRepository = void 0;
const prisma_client_1 = require("./prisma-client");
const prisma = (0, prisma_client_1.getPrismaClient)();
const Prisma = (0, prisma_client_1.getPrismaErrors)();
/**
 * Commit Repository - Handles all Commit-related database operations
 */
class CommitRepository {
    /**
     * Find all commits for a package
     */
    static async findByPackageName(packageName) {
        return await prisma.commit.findMany({
            where: { packageName },
        });
    }
    /**
     * Find a specific commit
     */
    static async findByHash(hash, packageName) {
        return await prisma.commit.findUnique({
            where: {
                hash_packageName: {
                    hash,
                    packageName,
                },
            },
        });
    }
    /**
     * Create or update a commit
     */
    static async upsert(data) {
        try {
            return await prisma.commit.upsert({
                where: {
                    hash_packageName: {
                        hash: data.hash,
                        packageName: data.packageName,
                    },
                },
                update: {
                    message: data.message || '',
                    author: data.author || '',
                    date: data.date,
                    type: data.type || '',
                },
                create: {
                    hash: data.hash,
                    message: data.message || '',
                    author: data.author || '',
                    date: data.date,
                    type: data.type || '',
                    packageName: data.packageName,
                },
            });
        }
        catch (e) {
            const err = e;
            if (err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002') {
                console.warn(`Skipping commit: ${data.hash} (Commit already exists)`);
            }
            else {
                console.error(`Failed to store commit: ${data.hash}`, err);
                throw err;
            }
        }
    }
    /**
     * Store multiple commits
     */
    static async storeMany(packageName, commits) {
        console.log('Storing commits for: ' + packageName);
        for (const commit of commits) {
            await this.upsert({
                hash: commit.hash,
                message: commit.message,
                author: commit.author,
                date: commit.date,
                type: commit.type,
                packageName,
            });
        }
    }
    /**
     * Delete all commits for a package
     */
    static async deleteByPackageName(packageName) {
        return await prisma.commit.deleteMany({
            where: { packageName },
        });
    }
}
exports.CommitRepository = CommitRepository;

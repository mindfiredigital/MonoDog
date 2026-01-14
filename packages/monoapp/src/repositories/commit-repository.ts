import { getPrismaClient, getPrismaErrors } from './prisma-client';
import type { Commit } from '../types';

const prisma = getPrismaClient();
const Prisma = getPrismaErrors();

/**
 * Commit Repository - Handles all Commit-related database operations
 */
export class CommitRepository {
  /**
   * Find all commits for a package
   */
  static async findByPackageName(packageName: string) {
    return await prisma.commit.findMany({
      where: { packageName },
    });
  }

  /**
   * Find a specific commit
   */
  static async findByHash(hash: string, packageName: string) {
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
  static async upsert(data: {
    hash: string;
    message?: string;
    author?: string;
    date?: string | Date;
    type?: string;
    packageName: string;
  }) {
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
    } catch (e) {
      const err = e as Error & { code?: string };
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        console.warn(`Skipping commit: ${data.hash} (Commit already exists)`);
      } else {
        console.error(`Failed to store commit: ${data.hash}`, err);
        throw err;
      }
    }
  }

  /**
   * Store multiple commits
   */
  static async storeMany(packageName: string, commits: Commit[]) {
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
  static async deleteByPackageName(packageName: string) {
    return await prisma.commit.deleteMany({
      where: { packageName },
    });
  }
}

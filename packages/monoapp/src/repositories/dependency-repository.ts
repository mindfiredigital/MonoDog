import { getPrismaClient, getPrismaErrors } from './prisma-client';
import type { DependencyInfo } from '../types';

const prisma = getPrismaClient();
const Prisma = getPrismaErrors();

/**
 * Dependency Repository - Handles all DependencyInfo-related database operations
 */
export class DependencyRepository {
  /**
   * Find all dependencies for a package
   */
  static async findByPackageName(packageName: string) {
    return await prisma.dependencyInfo.findMany({
      where: { packageName },
    });
  }

  /**
   * Find a specific dependency
   */
  static async findByNameAndPackage(name: string, packageName: string) {
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
  static async upsert(data: {
    name: string;
    version: string;
    type: string;
    latest?: string;
    outdated?: boolean;
    packageName: string;
  }) {
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
    } catch (e) {
      const err = e as Error & { code?: string };
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        console.warn(
          `Skipping dependency: ${data.name} (Dependency already exists)`
        );
      } else {
        console.error(`Failed to store dependency: ${data.name}`, err);
        throw err;
      }
    }
  }

  /**
   * Store multiple dependencies
   */
  static async storeMany(packageName: string, dependencies: DependencyInfo[]) {
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
  static async deleteByPackageName(packageName: string) {
    return await prisma.dependencyInfo.deleteMany({
      where: { packageName },
    });
  }
}

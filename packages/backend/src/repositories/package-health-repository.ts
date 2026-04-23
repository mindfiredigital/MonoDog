import { getPrismaClient } from './prisma-client';

const prisma = getPrismaClient();

/**
 * Package Health Repository - Handles all PackageHealth-related database operations
 */
export class PackageHealthRepository {
  /**
   * Find all package health records
   */
  static async findAll() {
    return await prisma.packageHealth.findMany();
  }

  /**
   * Find package health by package name
   */
  static async findByPackageName(packageName: string) {
    return await prisma.packageHealth.findUnique({
      where: { packageName },
    });
  }

  /**
   * Create or update package health record
   */
  static async upsert(data: {
    packageName: string;
    packageOverallScore: number;
    packageBuildStatus: string;
    packageTestCoverage: number;
    packageLintStatus: string;
    packageSecurity: string;
    packageDependencies?: string;
  }) {
    return await prisma.packageHealth.upsert({
      where: { packageName: data.packageName },
      update: {
        packageOverallScore: data.packageOverallScore,
        packageBuildStatus: data.packageBuildStatus,
        packageTestCoverage: data.packageTestCoverage,
        packageLintStatus: data.packageLintStatus,
        packageSecurity: data.packageSecurity,
        packageDependencies: data.packageDependencies || '',
        updatedAt: new Date(),
      },
      create: {
        packageName: data.packageName,
        packageOverallScore: data.packageOverallScore,
        packageBuildStatus: data.packageBuildStatus,
        packageTestCoverage: data.packageTestCoverage,
        packageLintStatus: data.packageLintStatus,
        packageSecurity: data.packageSecurity,
        packageDependencies: data.packageDependencies || '',
      },
    });
  }

  /**
   * Delete package health record
   */
  static async deleteByPackageName(packageName: string) {
    return await prisma.packageHealth.delete({
      where: { packageName },
    });
  }

  /**
   * Delete all package health records
   */
  static async deleteAll() {
    return await prisma.packageHealth.deleteMany();
  }
}

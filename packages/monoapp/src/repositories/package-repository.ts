import { getPrismaClient } from './prisma-client';
import type { PackageInfo } from '../types';

const prisma = getPrismaClient();

/**
 * Package Repository - Handles all Package-related database operations
 */
export class PackageRepository {
  /**
   * Find all packages
   */
  static async findAll() {
    return await prisma.package.findMany();
  }

  /**
   * Find a package by name
   */
  static async findByName(name: string) {
    return await prisma.package.findUnique({
      where: { name },
    });
  }

  /**
   * Find a package with related data
   */
  static async findByNameWithRelations(name: string) {
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
  static async upsert(data: {
    name: string;
    version?: string;
    type?: string;
    path?: string;
    description?: string;
    license?: string;
    repository?: Record<string, unknown>;
    scripts?: Record<string, unknown>;
    dependencies?: Record<string, unknown>;
    devDependencies?: Record<string, unknown>;
    peerDependencies?: Record<string, unknown>;
    maintainers?: string;
    status?: string;
  }) {
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
  static async updateStatus(name: string, status: string) {
    return await prisma.package.update({
      where: { name },
      data: { status },
    });
  }

  /**
   * Update package configuration
   */
  static async updateConfig(name: string, updateData: Record<string, unknown>) {
    const data: Record<string, unknown> = {
      lastUpdated: new Date(),
    };

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
  static async deleteByName(name: string) {
    return await prisma.package.delete({
      where: { name },
    });
  }
}

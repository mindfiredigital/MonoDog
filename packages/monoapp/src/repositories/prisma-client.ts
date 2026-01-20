import * as PrismaPkg from '@prisma/client';

const PrismaClient = (PrismaPkg as any).PrismaClient || (PrismaPkg as any).default || PrismaPkg;
const Prisma = (PrismaPkg as any).Prisma || (PrismaPkg as any).PrismaClient?.Prisma || (PrismaPkg as any).default?.Prisma || PrismaPkg;

let prismaInstance: ReturnType<typeof PrismaClient> | null = null;

/**
 * Get singleton instance of Prisma Client
 */
export function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

/**
 * Get Prisma error classes for error handling
 */
export function getPrismaErrors() {
  return Prisma;
}

export default getPrismaClient;

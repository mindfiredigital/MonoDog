import * as PrismaPkg from '@prisma/client';

// Fallback import to handle environments where PrismaClient isn't a named export
const PrismaClient =
  (PrismaPkg as any).PrismaClient || (PrismaPkg as any).default || PrismaPkg;

export const prisma = new PrismaClient();

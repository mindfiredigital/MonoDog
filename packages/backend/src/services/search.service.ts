import { prisma } from '../db/prisma';
import { transformPackage } from './package.service';

export const searchMonorepoPackages = async (
  query?: string,
  type?: string,
  status?: string
) => {
  const where: any = {};

  if (query) {
    const searchTerm = query.toLowerCase();
    where.OR = [
      { name: { contains: searchTerm } },
      { description: { contains: searchTerm } },
    ];
  }

  if (type && type !== 'all') {
    where.type = type;
  }

  if (status && status !== 'all') {
    where.status = status;
  }

  const dbPackages = await prisma.package.findMany({
    where,
    include: { _count: { select: { commits: true } } },
  });

  const formattedResults = dbPackages.map(transformPackage);

  return {
    query,
    results: formattedResults,
    total: formattedResults.length,
    filters: {
      type,
      status,
    },
  };
};

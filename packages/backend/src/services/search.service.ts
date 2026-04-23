import { scanMonorepo } from '@monodog/utils/helpers';

export const searchMonorepoPackages = async (
  query?: string,
  type?: string,
  status?: string
) => {
  const packages = scanMonorepo(process.cwd());

  let filtered = packages;

  if (query) {
    const searchTerm = query.toLowerCase();

    filtered = filtered.filter(
      (pkg: any) =>
        pkg.name.toLowerCase().includes(searchTerm) ||
        pkg.description?.toLowerCase().includes(searchTerm)
    );
  }

  if (type && type !== 'all') {
    filtered = filtered.filter((pkg: any) => pkg.type === type);
  }

  if (status && status !== 'all') {
    // Placeholder for future status filtering
  }

  return {
    query,
    results: filtered,
    total: filtered.length,
    filters: {
      type,
      status,
    },
  };
};

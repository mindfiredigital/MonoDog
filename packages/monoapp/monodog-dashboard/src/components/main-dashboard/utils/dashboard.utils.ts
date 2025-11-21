import { Package, PackageStats } from '../types/dashboard.types';

// Calculate package statistics
export const calculatePackageStats = (packages: Package[]): PackageStats => {
  return {
    total: packages.length,
    apps: packages.filter(p => p.type === 'app').length,
    libs: packages.filter(p => p.type === 'lib').length,
    tools: packages.filter(p => p.type === 'tool').length,
    custom: packages.filter(p => !['app', 'Plib', 'tool'].includes(p.type))
      .length,
    totalDependencies: packages.reduce(
      (sum, pkg) =>
        sum +
        Object.keys(pkg.dependencies).length +
        Object.keys(pkg.peerDependencies).length +
        Object.keys(pkg.devDependencies).length,
      0
    ),
  };
};

// Get unique package types for filtering
export const getUniquePackageTypes = (packages: Package[]): string[] => {
  return [...new Set(packages.map(pkg => pkg.type))];
};

// Filter packages based on search and type
export const filterPackages = (
  packages: Package[],
  searchTerm: string,
  selectedType: string
): Package[] => {
  return packages.filter(pkg => {
    const matchesSearch =
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || pkg.type === selectedType;
    return matchesSearch && matchesType;
  });
};

// Get status color for package type
export const getStatusColor = (type: string): string => {
  switch (type) {
    case 'app':
      return 'bg-blue-100 text-blue-800';
    case 'lib':
      return 'bg-green-100 text-green-800';
    case 'tool':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get icon for package type
export const getTypeIcon = (type: string): string => {
  switch (type) {
    case 'app':
      return '🚀';
    case 'lib':
      return '📚';
    case 'tool':
      return '🔧';
    default:
      return '📦';
  }
};

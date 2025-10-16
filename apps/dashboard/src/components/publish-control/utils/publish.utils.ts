import { Package, PublishStats } from '../types/publish.types';

// Calculate publish statistics
export const calculatePublishStats = (packages: Package[]): PublishStats => {
  return {
    readyToPublish: packages.filter(p => p.status === 'ready').length,
    inProgress: packages.filter(
      p => p.status === 'building' || p.status === 'testing'
    ).length,
    published: packages.filter(p => p.status === 'published').length,
  };
};

// Get status color for package status
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ready':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'building':
    case 'testing':
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'published':
      return 'bg-purple-100 text-purple-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get publish type color
export const getPublishTypeColor = (type: string): string => {
  switch (type) {
    case 'patch':
      return 'bg-green-100 text-green-800';
    case 'minor':
      return 'bg-blue-100 text-blue-800';
    case 'major':
      return 'bg-red-100 text-red-800';
    case 'prerelease':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Filter packages by name
export const filterPackagesByName = (
  packages: Package[],
  selectedPackage: string
): Package[] => {
  return selectedPackage === 'all'
    ? packages
    : packages.filter(pkg => pkg.name === selectedPackage);
};

import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

// Import sub-components
import {
  LoadingState,
  ErrorState,
  PackageStats,
  SearchAndFilter,
  PackagesTable,
} from './components';

// Import types and utilities
import {
  Package,
  PackageFilters,
  PackageSorting,
} from './types/packages.types';
import {
  calculatePackageStats,
  getUniquePackageTypes,
  getUniquePackageStatuses,
  filterPackages,
  sortPackages,
} from './utils/packages.utils';

// Import service
import { monorepoService } from '../../../services/monorepoService';

// Re-export types for backward compatibility
export type { Package } from './types/packages.types';

export default function PackagesOverview() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and sorting state
  const [filters, setFilters] = useState<PackageFilters>({
    search: '',
    type: 'all',
    status: 'all',
  });

  const [sorting, setSorting] = useState<PackageSorting>({
    field: 'name',
    order: 'asc',
  });

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await monorepoService.getPackages();
        setPackages(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch packages');
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Handle retry
  const handleRetry = () => {
    window.location.reload();
  };

  // Process packages for display
  const filteredPackages = filterPackages(packages, filters);
  const sortedPackages = sortPackages(filteredPackages, sorting);
  const stats = calculatePackageStats(packages);
  const availableTypes = getUniquePackageTypes(packages);
  const availableStatuses = getUniquePackageStatuses(packages);

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading text-2xl">Packages Overview</h1>
          <p className="text-body mt-1">
            Manage and monitor all packages in your monorepo
          </p>
        </div>
        {/* <button className="btn-primary flex items-center space-x-2">
          <PlusIcon className="w-5 h-5" />
          <span>Add Package</span>
        </button> */}
      </div>

      {/* Stats Cards */}
      <PackageStats stats={stats} />

      {/* Search and Filters */}
      <SearchAndFilter
        filters={filters}
        onFiltersChange={setFilters}
        availableTypes={availableTypes}
        availableStatuses={availableStatuses}
      />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {sortedPackages.length} of {packages.length} packages
          {filters.search && ` matching "${filters.search}"`}
        </span>
        <span>
          {filters.type !== 'all' && `Filtered by type: ${filters.type}`}
          {filters.status !== 'all' && ` • status: ${filters.status}`}
        </span>
      </div>

      {/* Packages Table */}
      <PackagesTable
        packages={sortedPackages}
        sorting={sorting}
        onSortChange={setSorting}
      />

      {/* Empty State */}
      {sortedPackages.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-neutral-400 text-6xl mb-4">📦</div>
          <h3 className="text-heading text-lg mb-2">No packages found</h3>
          <p className="text-body mb-4">
            {filters.search ||
            filters.type !== 'all' ||
            filters.status !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by adding your first package to the monorepo.'}
          </p>
          {(filters.search ||
            filters.type !== 'all' ||
            filters.status !== 'all') && (
            <button
              onClick={() =>
                setFilters({ search: '', type: 'all', status: 'all' })
              }
              className="text-primary-600 hover:text-primary-500"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

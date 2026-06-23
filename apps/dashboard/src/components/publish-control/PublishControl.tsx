import { useState, useEffect } from 'react';
import { monorepoService } from '../../services/monorepoService';
import { DASHBOARD_ERROR_MESSAGES } from '../../constants/messages';

// Import sub-components
import {
  PublishHeader,
  QuickActionCards,
  PackageReleaseTable,
  ReleaseSchedule,
  ChangelogViewer,
  ErrorState,
} from './components';
import { TableSkeleton } from '../skeletons';

// Import types and utilities
import { Package, Release } from './types/publish.types';
import {
  calculatePublishStats,
  filterPackagesByName,
} from './utils/publish.utils';

// Re-export types for backward compatibility
export type { Package, Release } from './types/publish.types';



export default function PublishControl() {
  const [selectedPackage, setSelectedPackage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackageData = async () => {
      try {
        setLoading(true);
        const data = await monorepoService.getPackages();
        // Convert monorepo service data to publish control format
        const publishPackages: Package[] = data.map(pkg => ({
          name: pkg.name,
          currentVersion: pkg.version,
          nextVersion: getNextVersion(pkg.version),
          status: getPublishStatus(pkg.status),
          lastPublished: pkg.lastUpdated,
          changelog: pkg.description || 'No changelog available',
          commits: Math.floor(Math.random() * 20) + 1,
          dependencies: pkg.dependencies || [],
          publishType: getPublishType(),
        }));
        setPackages(publishPackages);
        setError(null);
      } catch (err) {
        setError(DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_PACKAGES);
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageData();
  }, []);

  // Helper functions
  const getNextVersion = (currentVersion: string): string => {
    const parts = currentVersion.split('.').map(Number);
    parts[2] += 1; // Increment patch version
    return parts.join('.');
  };

  const getPublishStatus = (
    status: string
  ): 'ready' | 'building' | 'testing' | 'published' | 'failed' => {
    switch (status) {
      case 'healthy':
        return 'ready';
      case 'warning':
        return 'testing';
      case 'error':
        return 'failed';
      case 'building':
        return 'building';
      default:
        return 'ready';
    }
  };

  const getPublishType = (): 'patch' | 'minor' | 'major' | 'prerelease' => {
    const types: ('patch' | 'minor' | 'major' | 'prerelease')[] = [
      'patch',
      'minor',
      'major',
      'prerelease',
    ];
    return types[Math.floor(Math.random() * types.length)];
  };

  // Handle actions
  const handleNewRelease = () => {
    // console.log('Creating new release...');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Calculate derived data using utility functions
  const filteredPackages = filterPackagesByName(packages, selectedPackage);
  const stats = calculatePublishStats(packages);

  if (loading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PublishHeader
        packageCount={packages.length}
        onNewRelease={handleNewRelease}
      />

      {/* Quick Action Cards */}
      <QuickActionCards stats={stats} />

      {/* Package Release Table */}
      <PackageReleaseTable
        packages={filteredPackages}
        selectedPackage={selectedPackage}
        onPackageChange={setSelectedPackage}
      />

      {/* Release Schedule */}
      <ReleaseSchedule
        releases={[]}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Changelog Viewer */}
      <ChangelogViewer />
    </div>
  );
}

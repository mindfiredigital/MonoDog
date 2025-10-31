import React, { useState, useEffect } from 'react';
import { monorepoService } from '../../services/monorepoService';

// Import sub-components
import {
  PublishHeader,
  QuickActionCards,
  PackageReleaseTable,
  ReleaseSchedule,
  ChangelogViewer,
  LoadingState,
  ErrorState,
} from './components';

// Import types and utilities
import { Package, Release } from './types/publish.types';
import {
  calculatePublishStats,
  filterPackagesByName,
} from './utils/publish.utils';

// Re-export types for backward compatibility
export type { Package, Release } from './types/publish.types';

const mockPackages: Package[] = [
  {
    name: 'dashboard',
    currentVersion: '1.0.0',
    nextVersion: '1.0.1',
    status: 'ready',
    lastPublished: '2024-01-10',
    changelog: 'Bug fixes and performance improvements',
    commits: 15,
    dependencies: ['react', 'tailwindcss'],
    publishType: 'patch',
  },
  {
    name: 'backend',
    currentVersion: '1.2.0',
    nextVersion: '1.3.0',
    status: 'building',
    lastPublished: '2024-01-08',
    changelog: 'New API endpoints and enhanced security',
    commits: 28,
    dependencies: ['express', 'prisma'],
    publishType: 'minor',
  },
  {
    name: 'utils',
    currentVersion: '0.5.2',
    nextVersion: '1.0.0',
    status: 'ready',
    lastPublished: '2024-01-05',
    changelog: 'Major refactor with breaking changes',
    commits: 42,
    dependencies: ['lodash'],
    publishType: 'major',
  },
  {
    name: 'ci-status',
    currentVersion: '0.3.1',
    nextVersion: '0.4.0',
    status: 'testing',
    lastPublished: '2024-01-12',
    changelog: 'Enhanced CI monitoring and reporting',
    commits: 18,
    dependencies: ['axios', 'ws'],
    publishType: 'minor',
  },
];

const mockReleases: Release[] = [
  {
    id: '1',
    packageName: 'dashboard',
    version: '1.0.1',
    status: 'scheduled',
    scheduledFor: '2024-01-16 10:00 AM',
    changelog: 'Bug fixes and performance improvements',
    author: 'team-frontend',
  },
  {
    id: '2',
    packageName: 'backend',
    version: '1.3.0',
    status: 'in-progress',
    scheduledFor: '2024-01-16 09:00 AM',
    startedAt: '2024-01-16 09:00 AM',
    changelog: 'New API endpoints and enhanced security',
    author: 'team-backend',
  },
  {
    id: '3',
    packageName: 'utils',
    version: '1.0.0',
    status: 'completed',
    scheduledFor: '2024-01-15 02:00 PM',
    startedAt: '2024-01-15 02:00 PM',
    completedAt: '2024-01-15 02:15 PM',
    changelog: 'Major refactor with breaking changes',
    author: 'team-shared',
  },
];

export default function PublishControl() {
  const [selectedPackage, setSelectedPackage] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [packages, setPackages] = useState<Package[]>(mockPackages);
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
        setError('Failed to fetch package data');
        console.error('Error fetching packages:', err);
        // Fallback to mock data
        setPackages(mockPackages);
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
    console.log('Creating new release...');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Calculate derived data using utility functions
  const filteredPackages = filterPackagesByName(packages, selectedPackage);
  const stats = calculatePublishStats(packages);

  if (loading) {
    return <LoadingState />;
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
        releases={mockReleases}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Changelog Viewer */}
      <ChangelogViewer />
    </div>
  );
}

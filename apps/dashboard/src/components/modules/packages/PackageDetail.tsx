import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// No additional icons needed - using sub-components

// Import sub-components
import {
  LoadingState,
  PackageDetailHeader,
  PackageDetailTabs,
  DependenciesTab,
  RecentCommitsTab,
  HealthMetricsTab,
  ConfigurationTab,
} from './components';

// Import types
import {
  PackageDetail as PackageDetailType,
  PackageDetailTab,
} from './types/packages.types';

// Re-export types for backward compatibility
export type { PackageDetail as PackageDetailType } from './types/packages.types';

// Mock data (in real implementation, this would come from an API)
const mockPackageDetail: PackageDetailType = {
  name: '@myorg/ui-components',
  version: '2.1.0',
  type: 'lib',
  status: 'healthy',
  description: 'Reusable UI components library for our design system',
  lastUpdated: '2024-01-15',
  dependencies: [
    {
      name: 'react',
      version: '18.2.0',
      latest: '18.2.0',
      status: 'up-to-date',
    },
    {
      name: 'typescript',
      version: '5.0.0',
      latest: '5.3.0',
      status: 'outdated',
    },
    {
      name: '@types/react',
      version: '18.0.0',
      latest: '18.2.0',
      status: 'outdated',
    },
    {
      name: 'tailwindcss',
      version: '3.3.0',
      latest: '4.0.0',
      status: 'major-update',
    },
  ],
  devDependencies: [
    { name: 'jest', version: '29.0.0', latest: '29.7.0', status: 'outdated' },
    {
      name: '@testing-library/react',
      version: '13.0.0',
      latest: '14.1.0',
      status: 'major-update',
    },
    {
      name: 'storybook',
      version: '7.0.0',
      latest: '7.6.0',
      status: 'outdated',
    },
  ],
  maintainers: ['john.doe@company.com', 'jane.smith@company.com'],
  tags: ['ui', 'components', 'design-system', 'react'],
  repository: 'https://github.com/myorg/monorepo',
  license: 'MIT',
  scripts: {
    build: 'tsc && vite build',
    dev: 'vite',
    test: 'jest',
    'test:watch': 'jest --watch',
    lint: 'eslint src --ext .ts,.tsx',
    'lint:fix': 'eslint src --ext .ts,.tsx --fix',
    storybook: 'storybook dev -p 6006',
    'build-storybook': 'storybook build',
  },
  recentCommits: [
    {
      hash: '1a2b3c4',
      message: 'feat: add new Button variant with loading state',
      author: 'John Doe',
      date: '2024-01-15',
      type: 'feature',
    },
    {
      hash: '5d6e7f8',
      message: 'fix: resolve accessibility issues in Modal component',
      author: 'Jane Smith',
      date: '2024-01-14',
      type: 'fix',
    },
    {
      hash: '9g0h1i2',
      message: 'chore: update dependencies',
      author: 'Bob Wilson',
      date: '2024-01-13',
      type: 'chore',
    },
  ],
  healthScore: 85,
  buildStatus: 'success',
  testCoverage: 78,
  lintStatus: 'pass',
};

export default function PackageDetail() {
  const { name } = useParams<{ name: string }>();
  const [packageData, setPackageData] = useState<PackageDetailType | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<PackageDetailTab>('overview');

  useEffect(() => {
    // In real implementation, fetch package data based on name
    // For now, using mock data
    setPackageData(mockPackageDetail);
  }, [name]);

  // Loading state
  if (!packageData) {
    return <LoadingState message="Loading package details..." />;
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="py-6">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Package Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {packageData.description}
                  </p>

                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Maintainers
                  </h4>
                  <div className="space-y-1">
                    {packageData.maintainers.map(maintainer => (
                      <div key={maintainer} className="text-sm text-gray-600">
                        {maintainer}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Quick Stats
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dependencies:</span>
                      <span className="font-medium">
                        {Object.keys(packageData.dependencies).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dev Dependencies:</span>
                      <span className="font-medium">
                        {packageData.devDependencies.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peer Dependencies:</span>
                      <span className="font-medium">
                        {Object(packageData.peerDependencies).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scripts:</span>
                      <span className="font-medium">
                        {Object.keys(packageData.scripts).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recent Commits:</span>
                      <span className="font-medium">
                        {packageData.recentCommits.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'dependencies':
        return <DependenciesTab packageData={packageData} />;
      case 'commits':
        return <RecentCommitsTab packageData={packageData} />;
      case 'health':
        return <HealthMetricsTab packageData={packageData} />;
      case 'config':
        return <ConfigurationTab packageData={packageData} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Package Header */}
      <PackageDetailHeader packageData={packageData} />

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow border">
        <PackageDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <div className="px-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}

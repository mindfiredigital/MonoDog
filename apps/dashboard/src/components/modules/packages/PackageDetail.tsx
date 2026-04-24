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

import { monorepoService } from '../../../services/monorepoService';

// Re-export types for backward compatibility
export type { PackageDetail as PackageDetailType } from './types/packages.types';

export default function PackageDetail() {
  const { name } = useParams<{ name: string }>();
  const [packageData, setPackageData] = useState(
    null
  );
  const [activeTab, setActiveTab] = useState<PackageDetailTab>('overview');

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const data = await monorepoService.getPackage(name ?? '');
        setPackageData(data);
      } catch (err) {
        console.error('Error fetching packages:', err);
      }
    };

    fetchPackage();
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

                  <h4 className="hidden text-sm font-medium text-gray-700 mb-2">
                    Maintainers
                  </h4>
                  <div className="space-y-1">
                    {Object.keys(packageData.maintainers).map(maintainer => (
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
                        {
                          packageData.dependenciesInfo.filter(
                            d => d.type == 'dependency'
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dev Dependencies:</span>
                      <span className="font-medium">
                        {
                          packageData.dependenciesInfo.filter(
                            d => d.type == 'devDependency'
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peer Dependencies:</span>
                      <span className="font-medium">
                        {
                          packageData.dependenciesInfo.filter(
                            d => d.type == 'peerDependency'
                          ).length
                        }
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
                        {packageData.commits?.length}
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

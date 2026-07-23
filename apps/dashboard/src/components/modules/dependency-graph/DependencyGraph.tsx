import { useState, useEffect, useMemo } from 'react';
import { monorepoService } from '../../../services/monorepoService';
import { DASHBOARD_ERROR_MESSAGES } from '../../../constants/messages';
// Import sub-components
import {
  ErrorState,
  DependencyGraphHeader,
  GraphToolbar,
  GraphVisualization,
  DependencyList,
  DependencyDetails,
  GraphStats,
  CircularDependencies,
} from './components';
import { InformationCircleIcon } from '../../../icons/heroicons';
import { CardGridSkeleton } from '../../skeletons';
import { PackageNode } from './types/dependency.types';

// Import types and utilities
import {
  calculateGraphStats,
  detectCircularDependencies,
  sortPackages,
  mapAllDependents,
} from './utils/dependency.utils';
export type { PackageNode } from './types/dependency.types';

export default function DependencyGraph() {
  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const pkgs = await monorepoService.getPackages();
        const dependentsMap = mapAllDependents(
          pkgs as unknown as PackageNode[]
        );
        const packagesMap = pkgs.map(pkg => ({
          ...pkg, // Keep all existing package data
          dependencies: {
            ...pkg.dependencies,
            ...pkg.devDependencies,
            ...pkg.peerDependencies,
          },
          dependents: dependentsMap[pkg.name],
        }));

        setPackages(packagesMap as unknown as PackageNode[]);
        setError(null);
      } catch (err) {
        setError(DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_PACKAGES);
        console.error('Error fetching packages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageNode[]>([]);

  // View state
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [layout, setLayout] = useState<'TB' | 'LR'>('TB');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // List view state
  const [sortBy, setSortBy] = useState<
    'name' | 'dependencies' | 'dependents' | 'status'
  >('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Computed values
  const sortedPackages = useMemo(() => {
    return sortPackages(packages, sortBy, sortOrder);
  }, [packages, sortBy, sortOrder]);

  const stats = useMemo(() => {
    return calculateGraphStats(packages);
  }, [packages]);

  const circularDependencies = useMemo(() => {
    return detectCircularDependencies(packages);
  }, [packages]);

  const selectedPackageData = selectedPackage
    ? packages.find(pkg => pkg.name === selectedPackage) || null
    : null;

  // Event handlers
  const handleRefresh = () => {
    window.location.reload();
  };

  const handlePackageSelect = (packageId: string | null) => {
    setSelectedPackage(packageId);
  };

  const handleSortChange = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field as any);
    setSortOrder(order);
  };

  const handleRetry = () => {
    window.location.reload();
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <CardGridSkeleton cards={4} />
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DependencyGraphHeader onRefresh={handleRefresh} loading={loading} />

      {/* Stats */}
      <GraphStats stats={stats} packages={packages ?? []} />

      {/* Circular Dependencies Warning */}
      {circularDependencies.length > 0 && (
        <CircularDependencies
          cycles={circularDependencies}
          packages={packages}
          onPackageSelect={handlePackageSelect}
        />
      )}

      {/* Toolbar */}
      <GraphToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        layout={layout}
        onLayoutChange={setLayout}
        showLegend={false}
        onToggleLegend={() => {}}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph/List View */}
        <div
          className={`${viewMode === 'graph' ? 'lg:col-span-3' : 'lg:col-span-4'}`}
        >
          {viewMode === 'graph' ? (
            <div className="relative h-[600px] w-full">
              <GraphVisualization
                packages={packages}
                selectedPackage={selectedPackage}
                hoveredPackage={hoveredPackage}
                onPackageSelect={handlePackageSelect}
                onPackageHover={setHoveredPackage}
                layout={layout}
              />
            </div>
          ) : (
            <DependencyList
              packages={sortedPackages}
              selectedPackage={selectedPackage}
              onPackageSelect={handlePackageSelect}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          )}
        </div>

        {/* Right Panel */}
        {viewMode === 'graph' && (
          <div className="lg:col-span-1">
            {selectedPackageData ? (
              <DependencyDetails
                package={selectedPackageData}
                packages={packages}
                onClose={() => setSelectedPackage(null)}
              />
            ) : (
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col items-center justify-center text-gray-500">
                <InformationCircleIcon className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-sm font-medium">Please select a package</p>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Click any node on the graph to view its details.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Empty State */}
      {/* {packages.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="flex justify-center text-gray-400 text-6xl mb-4"><LinkIcon className="w-6 h-6 text-primary-600" /></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No dependencies found
          </h3>
          <p className="text-gray-600 mb-4">
            No package dependencies available to display.
          </p>
        </div>
      )} */}
    </div>
  );
}

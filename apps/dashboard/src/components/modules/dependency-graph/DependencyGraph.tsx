import { useState, useEffect, useMemo } from 'react';
import { monorepoService } from '../../../services/monorepoService';
// Import sub-components
import {
  LoadingState,
  ErrorState,
  DependencyGraphHeader,
  GraphToolbar,
  GraphVisualization,
  DependencyList,
  DependencyDetails,
  GraphStats,
  CircularDependencies,
  GraphLegend,
} from './components';

// Import types and utilities
import { PackageNode } from './types/dependency.types';
import {
  calculateGraphStats,
  detectCircularDependencies,
  sortPackages,
  calculateLayout,
  mapAllDependents,
} from './utils/dependency.utils';

// Re-export types for backward compatibility
export type { PackageNode } from './types/dependency.types';

// Mock data for dependency graph
// const mockPackages: PackageNode[] = [
//   {
//     // id: 'dashboard',
//     name: 'dashboard',
//     type: 'app',
//     version: '0.1.0',
//     status: 'healthy',
//     dependencies: ['utils', 'backend'],
//     dependents: [],
//     // x: 400,
//     // y: 100,
//   },
//   {
//     // id: 'backend',
//     name: 'backend',
//     type: 'app',
//     version: '1.2.0',
//     status: 'healthy',
//     dependencies: ['utils'],
//     dependents: [],
//     // x: 200,
//     // y: 200,
//   },
//   {
//     // id: 'utils',
//     name: 'utils',
//     type: 'lib',
//     version: '2.0.1',
//     status: 'healthy',
//     dependencies: [],
//     dependents: [],
//     // x: 100,
//     // y: 300,
//   },
//   {
//     // id: 'cli-tool',
//     name: 'cli-tool',
//     type: 'tool',
//     version: '1.0.5',
//     status: 'warning',
//     dependencies: ['utils'],
//     dependents: [],
//     // x: 300,
//     // y: 400,
//   },
// ];

export default function DependencyGraph() {

    // Fetch packages
    useEffect(() => {
      const fetchPackages = async () => {
        try {
          setLoading(true);
          const pkgs = await monorepoService.getPackages();
          const dependentsMap = mapAllDependents(pkgs);
          const packagesMap = pkgs.map(pkg => ({
          ...pkg, // Keep all existing package data
          dependencies: {...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies},
          dependents: dependentsMap[pkg.name],
        }));

          setPackages(packagesMap);
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
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [packages, setPackages] = useState<PackageNode[]>([]);

  // View state
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [layout, setLayout] = useState<'hierarchical' | 'circular' | 'force'>(
    'hierarchical'
  );
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  // List view state
  const [sortBy, setSortBy] = useState<
    'name' | 'dependencies' | 'dependents' | 'status'
  >('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Computed values
  const layoutedPackages = useMemo(() => {
    return calculateLayout(packages ?? [], layout, 800, 600);
  }, [packages, layout]);

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
    // In real implementation, this would refetch data
    console.log('Refreshing dependency graph...');
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
    return <LoadingState />;
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
        showLegend={showLegend}
        onToggleLegend={() => setShowLegend(!showLegend)}
        zoomLevel={zoomLevel}
        onZoomChange={setZoomLevel}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph/List View */}
        <div className={`${showLegend ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          {viewMode === 'graph' ? (
            <div className="relative">
              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                }}
              >
                <GraphVisualization
                  packages={layoutedPackages}
                  selectedPackage={selectedPackage}
                  hoveredPackage={hoveredPackage}
                  onPackageSelect={handlePackageSelect}
                  onPackageHover={setHoveredPackage}
                  layout={layout}
                />
              </div>

              {/* Package Details Overlay */}
              <DependencyDetails
                package={selectedPackageData}
                packages={packages}
                onClose={() => setSelectedPackage(null)}
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

        {/* Legend */}
        {showLegend && (
          <div className="lg:col-span-1">
            <GraphLegend show={showLegend} />
          </div>
        )}
      </div>

      {/* Empty State */}
      {packages.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔗</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No dependencies found
          </h3>
          <p className="text-gray-600 mb-4">
            No package dependencies available to display.
          </p>
        </div>
      )}
    </div>
  );
}

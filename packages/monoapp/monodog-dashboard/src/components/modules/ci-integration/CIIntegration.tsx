import { useState, useEffect } from 'react';
import { RocketLaunchIcon } from '../../../icons/heroicons';
// Import sub-components
import {
  LoadingState,
  ErrorState,
  CIIntegrationHeader,
  BuildOverview,
  BuildList,
  PipelineStatus,
  BuildDetails,
} from './components';

// Import types and utilities
import { Build, Pipeline, CIFilters } from './types/ci.types';
import { calculateBuildStats, filterBuilds } from './utils/ci.utils';

// Import service
import { monorepoService } from '../../../services/monorepoService';

// Re-export types for backward compatibility
export type { Build, Pipeline, CIFilters } from './types/ci.types';

// Mock pipelines data (since not included in service yet)
const mockPipelines: Pipeline[] = [
  {
    id: '1',
    name: 'Dashboard CI',
    packageName: 'dashboard',
    status: 'active',
    lastRun: '2024-01-16T09:00:00Z',
    nextRun: '2024-01-16T10:00:00Z',
    successRate: 95,
    avgDuration: 420,
    triggers: ['push', 'pull_request'],
  },
  {
    id: '2',
    name: 'Backend CI',
    packageName: 'backend',
    status: 'active',
    lastRun: '2024-01-16T08:30:00Z',
    nextRun: '2024-01-16T09:30:00Z',
    successRate: 88,
    avgDuration: 900,
    triggers: ['push', 'pull_request', 'tag'],
  },
  {
    id: '3',
    name: 'Utils CI',
    packageName: 'utils',
    status: 'paused',
    lastRun: '2024-01-16T08:00:00Z',
    successRate: 75,
    avgDuration: 600,
    triggers: ['push', 'pull_request'],
  },
];

export default function CIIntegration() {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [pipelines] = useState<Pipeline[]>(mockPipelines);

  // Selection state
  const [selectedBuild, setSelectedBuild] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<CIFilters>({
    package: 'all',
    status: 'all',
    pipeline: 'all',
    dateRange: 'all',
  });

  // Fetch build data
  useEffect(() => {
    const fetchBuildData = async () => {
      try {
        setLoading(true);
        const data = await monorepoService.getBuildStatus();

        // Transform the data to match our Build interface
        const transformedData: Build[] = data.map((build: any) => ({
          id: build.id || Math.random().toString(36).substr(2, 9),
          packageName: build.package || build.packageName || 'unknown',
          branch: build.branch || 'main',
          commit: build.commit || 'unknown',
          status: build.status || 'pending',
          startTime: build.startTime || new Date().toISOString(),
          endTime: build.endTime,
          duration: build.duration,
          stages: build.stages || [],
          triggeredBy: build.triggeredBy || 'system',
          artifacts: build.artifacts || [],
        }));

        setBuilds(transformedData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch build data');
        console.error('Error fetching build data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildData();
  }, []);

  // Get filtered builds and statistics
  const filteredBuilds = filterBuilds(builds, filters);
  const stats = calculateBuildStats(builds);
  const selectedBuildData = selectedBuild
    ? builds.find(build => build.id === selectedBuild) || null
    : null;

  // Event handlers
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleTriggerBuild = () => {
    // In a real implementation, this would trigger a new build
    console.log('Triggering new build...');
  };

  const handleCreatePipeline = () => {
    // In a real implementation, this would open a pipeline creation dialog
    console.log('Creating new pipeline...');
  };

  const handleBuildSelect = (buildId: string | null) => {
    setSelectedBuild(buildId);
  };

  const handlePipelineSelect = (pipelineId: string) => {
    // In a real implementation, this would show pipeline details
    console.log('Selected pipeline:', pipelineId);
  };

  const handlePipelineToggle = (pipelineId: string, active: boolean) => {
    // In a real implementation, this would toggle pipeline status
    console.log('Toggle pipeline:', pipelineId, 'active:', active);
  };

  const handleBuildCancel = (buildId: string) => {
    // In a real implementation, this would cancel the build
    console.log('Cancelling build:', buildId);
    setSelectedBuild(null);
  };

  const handleBuildRetry = (buildId: string) => {
    // In a real implementation, this would retry the build
    console.log('Retrying build:', buildId);
    setSelectedBuild(null);
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
      <CIIntegrationHeader
        onTriggerBuild={handleTriggerBuild}
        onCreatePipeline={handleCreatePipeline}
      />

      {/* Build Overview */}
      <BuildOverview
        stats={stats}
        onRefresh={handleRefresh}
        loading={loading}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Build List */}
        <div className="lg:col-span-2">
          <BuildList
            builds={filteredBuilds}
            selectedBuild={selectedBuild}
            onBuildSelect={handleBuildSelect}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Pipeline Status */}
        <div className="lg:col-span-1">
          <PipelineStatus
            pipelines={pipelines}
            onPipelineSelect={handlePipelineSelect}
            onPipelineToggle={handlePipelineToggle}
          />
        </div>
      </div>

      {/* Build Details Modal */}
      <BuildDetails
        build={selectedBuildData}
        onClose={() => setSelectedBuild(null)}
        onCancel={handleBuildCancel}
        onRetry={handleBuildRetry}
      />

      {/* Empty State */}
      {filteredBuilds.length === 0 && builds.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No builds found
          </h3>
          <p className="text-gray-600 mb-4">
            No builds match your current filters. Try adjusting your search
            criteria.
          </p>
          <button
            onClick={() =>
              setFilters({
                package: 'all',
                status: 'all',
                pipeline: 'all',
                dateRange: 'all',
              })
            }
            className="text-blue-600 hover:text-blue-500"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* No Data State */}
      {builds.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4"><RocketLaunchIcon className="w-6 h-6 text-primary-600" /></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No CI/CD data available
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by triggering your first build or setting up a pipeline.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleTriggerBuild}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Trigger Build
            </button>
            <button
              onClick={handleCreatePipeline}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Pipeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

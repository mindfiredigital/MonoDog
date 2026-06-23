import { useState, useEffect } from 'react';
import { RocketLaunchIcon } from '../../../icons/heroicons';
// Import sub-components
import {
  ErrorState,
  CIIntegrationHeader,
  BuildOverview,
  BuildList,
  PipelineStatus,
  BuildDetails,
} from './components';
import { TableSkeleton } from '../../skeletons';

// Import types and utilities
import { Build, Pipeline, CIFilters } from './types/ci.types';
import { calculateBuildStats, filterBuilds } from './utils/ci.utils';

// Import service and constants
import { monorepoService } from '../../../services/monorepoService';
import { DASHBOARD_ERROR_MESSAGES } from '../../../constants/messages';

// Re-export types for backward compatibility
export type { Build, Pipeline, CIFilters } from './types/ci.types';


export default function CIIntegration() {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);

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
        const transformedData: Build[] = data.map(
          (build: Record<string, unknown>) => ({
            id: (build.id as string) || Math.random().toString(36).substr(2, 9),
            packageName:
              (build.package as string) ||
              (build.packageName as string) ||
              'unknown',
            branch: (build.branch as string) || 'main',
            commit: (build.commit as string) || 'unknown',
            status: (build.status as string) || 'pending',
            startTime: (build.startTime as string) || new Date().toISOString(),
            endTime: build.endTime as string | undefined,
            duration: build.duration as number | undefined,
            stages: build.stages || [],
            triggeredBy: build.triggeredBy || 'system',
            artifacts: build.artifacts || [],
          })
        );

        // get pipelines from the unique workflow names in the runs
        const uniqueWorkflowNames = Array.from(new Set(data.map((b: any) => b.name).filter(Boolean)));
        const derivedPipelines: Pipeline[] = uniqueWorkflowNames.map((name: any, index) => ({
          id: String(index),
          name: name as string,
          packageName: 'monorepo',
          status: 'active',
          lastRun: new Date().toISOString(),
          successRate: 100,
          avgDuration: 0,
          triggers: ['github_actions'],
        }));

        setPipelines(derivedPipelines);
        setBuilds(transformedData);
        setError(null);
      } catch (err) {
        setError(DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_PACKAGES);
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
    return (
      <div className="space-y-6">
        <TableSkeleton rows={6} />
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
          <div className="text-gray-400 text-6xl mb-4">
            <RocketLaunchIcon className="w-6 h-6 text-primary-600" />
          </div>
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

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
  TriggerBuildModal,
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

  // Modal states
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // Fetch build data
  useEffect(() => {
    const fetchBuildData = async (isPolling = false) => {
      try {
        if (!isPolling) setLoading(true);
        const data = await monorepoService.getBuildStatus();

        // map GitHub's split status/conclusion to single UI status
        const mapGitHubStatus = (
          status: any,
          conclusion: any
        ): Build['status'] => {
          if (status === 'completed') {
            if (conclusion === 'success') return 'success';
            if (conclusion === 'failure') return 'failed';
            if (conclusion === 'cancelled') return 'cancelled';
            return 'failed';
          }
          if (status === 'in_progress') return 'running';
          return 'pending';
        };

        // Transform the GitHub data to match our Build interface precisely
        const transformedData: Build[] = data.map(
          (build: Record<string, unknown>) => ({
            id: String(build.id) || Math.random().toString(36).substr(2, 9),
            packageName: (build.name as string) || 'unknown',
            branch: (build.head_branch as string) || 'main',
            commit: (build.head_sha as string) || 'unknown',
            status: mapGitHubStatus(build.status, build.conclusion),
            startTime: (build.created_at as string) || new Date().toISOString(),
            endTime: build.updated_at as string | undefined,
            duration: build.created_at
              ? Math.round(
                  ((build.status === 'completed' && build.updated_at
                    ? new Date(build.updated_at as string).getTime()
                    : new Date().getTime()) -
                    new Date(build.created_at as string).getTime()) /
                    1000
                )
              : undefined,
            stages: (build.stages as Build['stages']) || [],
            triggeredBy: build.actor ? (build.actor as any).login : 'system',
            artifacts: (build.artifacts as Build['artifacts']) || [],
          })
        );

        // get pipelines from the unique workflow names in the runs
        const uniqueWorkflowNames = Array.from(
          new Set(data.map((b: any) => b.name).filter(Boolean))
        );
        const derivedPipelines: Pipeline[] = uniqueWorkflowNames.map(
          (name: any, index) => {
            // Get all builds for this workflow
            const workflowBuilds = data.filter((b: any) => b.name === name);
            const completedBuilds = workflowBuilds.filter(
              (b: any) => b.status === 'completed'
            );
            const successfulBuilds = completedBuilds.filter(
              (b: any) => b.conclusion === 'success'
            );

            // Calculate success rate from completed builds
            const successRate =
              completedBuilds.length > 0
                ? Math.round(
                    (successfulBuilds.length / completedBuilds.length) * 100
                  )
                : 0;

            // Calculate average duration in seconds from completed builds
            const durations = completedBuilds
              .map((b: any) => {
                if (b.created_at && b.updated_at) {
                  return (
                    (new Date(b.updated_at).getTime() -
                      new Date(b.created_at).getTime()) /
                    1000
                  );
                }
                return 0;
              })
              .filter((d: number) => d > 0);
            const avgDuration =
              durations.length > 0
                ? Math.round(
                    durations.reduce((a: number, b: number) => a + b, 0) /
                      durations.length
                  )
                : 0;

            // Get the most recent run timestamp
            const sortedByDate = [...workflowBuilds].sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
            const lastRun =
              sortedByDate[0]?.created_at || new Date().toISOString();

            return {
              id: String(index),
              name: name as string,
              packageName: (name as string) || 'monorepo',
              status:
                sortedByDate[0]?.conclusion === 'failure' ||
                sortedByDate[0]?.conclusion === 'cancelled'
                  ? 'failed'
                  : 'active',
              lastRun,
              successRate,
              avgDuration,
              triggers: ['github_actions'],
            };
          }
        );

        setPipelines(derivedPipelines);
        setBuilds(transformedData);
        setError(null);
      } catch (err) {
        setError(DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_PACKAGES);
        console.error('Error fetching build data:', err);
      } finally {
        if (!isPolling) setLoading(false);
      }
    };

    fetchBuildData();

    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(() => {
      fetchBuildData(true);
    }, 10000);

    return () => clearInterval(interval);
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

  const handleTriggerBuild = async (
    packageName: string,
    branch: string,
    workflowFileName: string
  ) => {
    setIsTriggering(true);
    try {
      await monorepoService.triggerCIBuild(
        packageName,
        branch,
        workflowFileName
      );

      setIsTriggerModalOpen(false);
      alert(
        'Pipeline successfully triggered! GitHub is provisioning the runner...'
      );

      // Poll after 5 seconds to gracefully fetch the newly created run ID from GitHub
      setTimeout(() => {
        handleRefresh();
      }, 5000);
    } catch (err) {
      console.error(err);
      alert(
        `Error triggering build: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setIsTriggering(false);
    }
  };

  const handleBuildSelect = (buildId: string | null) => {
    setSelectedBuild(buildId);
  };

  const handlePipelineSelect = (pipelineId: string) => {
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (pipeline) {
      // Filter builds to show only those matching this pipeline's workflow name
      setFilters(prev => ({
        ...prev,
        pipeline: prev.pipeline === pipeline.name ? 'all' : pipeline.name,
      }));
    }
  };

  const handlePipelineToggle = async (pipelineId: string, active: boolean) => {
    try {
      await monorepoService.togglePipeline(pipelineId, active);
      alert(`Pipeline ${active ? 'enabled' : 'disabled'} successfully!`);
      handleRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to toggle pipeline status');
    }
  };

  const handleBuildCancel = async (buildId: string) => {
    try {
      await monorepoService.cancelPipeline(buildId);
      alert('Pipeline successfully cancelled!');
      setSelectedBuild(null);
      handleRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel pipeline run');
    }
  };

  const handleBuildRetry = async (buildId: string) => {
    try {
      await monorepoService.retryPipeline(buildId);
      alert('Pipeline successfully restarted!');
      setSelectedBuild(null);
      handleRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to restart pipeline run');
    }
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
      <CIIntegrationHeader onTriggerBuild={() => setIsTriggerModalOpen(true)} />

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

      <TriggerBuildModal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        onSubmit={handleTriggerBuild}
        isLoading={isTriggering}
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
            Get started by triggering your first build.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setIsTriggerModalOpen(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Trigger Build
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

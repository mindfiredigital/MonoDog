import {
  Build,
  BuildStage,
  Pipeline,
  BuildStats,
  CIFilters,
} from '../types/ci.types';
import { RocketLaunchIcon } from '../../../../icons/heroicons';
import { CubeIcon } from '../../../../icons/heroicons';
import { Cog6ToothIcon } from '../../../../icons/heroicons';
// Get status color classes
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'success':
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'running':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'paused':
      return 'bg-gray-100 text-gray-800';
    case 'skipped':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get stage status color
export const getStageStatusColor = (status: string): string => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'running':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'skipped':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Calculate build statistics
export const calculateBuildStats = (builds: Build[]): BuildStats => {
  const total = builds.length;
  const successful = builds.filter(b => b.status === 'success').length;
  const failed = builds.filter(b => b.status === 'failed').length;
  const running = builds.filter(b => b.status === 'running').length;
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

  // Calculate average duration for completed builds
  const completedBuilds = builds.filter(b => b.duration);
  const avgDuration =
    completedBuilds.length > 0
      ? Math.round(
          completedBuilds.reduce((sum, b) => sum + (b.duration || 0), 0) /
            completedBuilds.length
        )
      : 0;

  return {
    total,
    successful,
    failed,
    running,
    successRate,
    avgDuration,
  };
};

// Filter builds based on criteria
export const filterBuilds = (builds: Build[], filters: CIFilters): Build[] => {
  return builds.filter(build => {
    const matchesPackage =
      filters.package === 'all' || build.packageName === filters.package;
    const matchesStatus =
      filters.status === 'all' || build.status === filters.status;

    // Date range filtering would be implemented here
    const matchesDateRange = true; // Placeholder

    return matchesPackage && matchesStatus && matchesDateRange;
  });
};

// Get unique package names from builds
export const getUniquePackages = (builds: Build[]): string[] => {
  return [...new Set(builds.map(build => build.packageName))];
};

// Get unique statuses from builds
export const getUniqueStatuses = (builds: Build[]): string[] => {
  return [...new Set(builds.map(build => build.status))];
};

// Format duration
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.floor((seconds % 3600) / 60);
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }
};

// Format date and time
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format relative time
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } else {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
};

// Get build progress percentage
export const getBuildProgress = (build: Build): number => {
  if (
    build.status === 'success' ||
    build.status === 'failed' ||
    build.status === 'cancelled'
  ) {
    return 100;
  }

  if (build.status === 'pending') {
    return 0;
  }

  const totalStages = build.stages.length;
  if (totalStages === 0) return 0;

  const completedStages = build.stages.filter(
    stage =>
      stage.status === 'success' ||
      stage.status === 'failed' ||
      stage.status === 'skipped'
  ).length;

  const runningStages = build.stages.filter(
    stage => stage.status === 'running'
  ).length;

  // If there's a running stage, count it as half complete
  const progress = (completedStages + runningStages * 0.5) / totalStages;
  return Math.round(progress * 100);
};

// Get stage icon
export const getStageIcon = (stageName: string): React.ReactNode => {
  const name = stageName.toLowerCase();
  if (name.includes('build') || name.includes('compile')) return '🔨';
  if (name.includes('test')) return '🧪';
  if (name.includes('lint') || name.includes('format')) return '✨';
  if (name.includes('deploy') || name.includes('publish')) return <RocketLaunchIcon className="w-6 h-6 text-primary-600" />;
  if (name.includes('security') || name.includes('audit')) return '🔒';
  if (name.includes('install') || name.includes('dependencies')) return <CubeIcon className="w-6 h-6 text-primary-600" />;
  return <Cog6ToothIcon className="w-6 h-6 text-primary-600" />;
};

// Sort builds by different criteria
export const sortBuilds = (
  builds: Build[],
  sortBy: 'startTime' | 'duration' | 'status' | 'packageName',
  order: 'asc' | 'desc'
): Build[] => {
  return [...builds].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'startTime':
        aValue = new Date(a.startTime);
        bValue = new Date(b.startTime);
        break;
      case 'duration':
        aValue = a.duration || 0;
        bValue = b.duration || 0;
        break;
      case 'status': {
        const statusOrder = {
          running: 0,
          pending: 1,
          failed: 2,
          cancelled: 3,
          success: 4,
        };
        aValue = statusOrder[a.status] || 5;
        bValue = statusOrder[b.status] || 5;
        break;
      }
      case 'packageName':
        aValue = a.packageName.toLowerCase();
        bValue = b.packageName.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// Get pipeline health score
export const getPipelineHealth = (
  pipeline: Pipeline
): 'healthy' | 'warning' | 'critical' => {
  if (pipeline.status === 'failed') return 'critical';
  if (pipeline.status === 'paused') return 'warning';
  if (pipeline.successRate < 70) return 'critical';
  if (pipeline.successRate < 85) return 'warning';
  return 'healthy';
};

// Calculate build stage duration
export const calculateStageDuration = (stages: BuildStage[]): number => {
  return stages.reduce((total, stage) => total + (stage.duration || 0), 0);
};

// Get commit short hash
export const getShortCommitHash = (commit: string): string => {
  return commit.substring(0, 8);
};

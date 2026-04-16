import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  StopIcon,
  FunnelIcon,
} from '../../../../icons/heroicons';
import { BuildListProps } from '../types/ci.types';
import {
  getStatusColor,
  formatDuration,
  formatRelativeTime,
  getBuildProgress,
  getShortCommitHash,
  getUniquePackages,
  getUniqueStatuses,
} from '../utils/ci.utils';

export default function BuildList({
  builds,
  selectedBuild,
  onBuildSelect,
  filters,
  onFiltersChange,
}: BuildListProps) {
  const availablePackages = getUniquePackages(builds);
  const availableStatuses = getUniqueStatuses(builds);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'running':
        return (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        );
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <StopIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <select
              value={filters.package}
              onChange={e =>
                onFiltersChange({ ...filters, package: e.target.value })
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Packages</option>
              {availablePackages.map(pkg => (
                <option key={pkg} value={pkg}>
                  {pkg}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filters.status}
            onChange={e =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            {availableStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={filters.dateRange}
            onChange={e =>
              onFiltersChange({ ...filters, dateRange: e.target.value })
            }
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Build List */}
      <div className="bg-white rounded-lg shadow border">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Builds</h3>
          <p className="text-sm text-gray-500 mt-1">
            {builds.length} build{builds.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {builds.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">🔨</div>
            <p className="text-gray-500">
              No builds found matching your filters
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {builds.map(build => {
              const progress = getBuildProgress(build);
              const isSelected = selectedBuild === build.id;

              return (
                <div
                  key={build.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onBuildSelect(isSelected ? null : build.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(build.status)}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {build.packageName}
                          </h4>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {build.branch}
                          </span>
                          <span className="text-xs text-gray-500 font-mono">
                            {getShortCommitHash(build.commit)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(build.status)}`}
                          >
                            {build.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            by {build.triggeredBy}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(build.startTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {build.duration && (
                        <div className="text-sm font-medium text-gray-900">
                          {formatDuration(build.duration)}
                        </div>
                      )}
                      {build.status === 'running' && (
                        <div className="mt-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {progress}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Build Stages Preview */}
                  {isSelected && build.stages.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {build.stages.map((stage, index) => (
                          <div
                            key={stage.name}
                            className={`flex items-center px-2 py-1 text-xs rounded ${getStatusColor(stage.status)}`}
                            title={`${stage.name}: ${stage.status}`}
                          >
                            {stage.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

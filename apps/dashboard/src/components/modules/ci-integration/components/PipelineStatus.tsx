import {
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '../../../../icons/heroicons';
import { PipelineStatusProps } from '../types/ci.types';
import {
  getStatusColor,
  formatDuration,
  formatRelativeTime,
  getPipelineHealth,
} from '../utils/ci.utils';

export default function PipelineStatus({
  pipelines,
  onPipelineSelect,
  onPipelineToggle,
}: PipelineStatusProps) {
  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'critical':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <Cog6ToothIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (pipelines.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="text-center">
          <Cog6ToothIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Pipelines Configured
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first CI/CD pipeline to automate builds
            and deployments.
          </p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create Pipeline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Pipeline Status</h3>
        <p className="text-sm text-gray-500 mt-1">
          {pipelines.length} pipeline{pipelines.length !== 1 ? 's' : ''}{' '}
          configured
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {pipelines.map(pipeline => {
          const health = getPipelineHealth(pipeline);

          return (
            <div
              key={pipeline.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onPipelineSelect(pipeline.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getHealthIcon(health)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {pipeline.name}
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {pipeline.packageName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pipeline.status)}`}
                      >
                        {pipeline.status}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthColor(health)}`}
                      >
                        {health}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Pipeline Toggle */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onPipelineToggle(
                        pipeline.id,
                        pipeline.status !== 'active'
                      );
                    }}
                    className={`p-2 rounded-lg transition-colors ${
                      pipeline.status === 'active'
                        ? 'text-green-600 hover:bg-green-100'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={
                      pipeline.status === 'active'
                        ? 'Pause Pipeline'
                        : 'Activate Pipeline'
                    }
                  >
                    {pipeline.status === 'active' ? (
                      <PauseIcon className="w-5 h-5" />
                    ) : (
                      <PlayIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Pipeline Metrics */}
              <div className="mt-3 grid grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-500">Success Rate:</span>
                  <div
                    className={`font-medium ${
                      pipeline.successRate >= 90
                        ? 'text-green-600'
                        : pipeline.successRate >= 70
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}
                  >
                    {pipeline.successRate}%
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Avg Duration:</span>
                  <div className="font-medium text-gray-900">
                    {formatDuration(pipeline.avgDuration)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Last Run:</span>
                  <div className="font-medium text-gray-900">
                    {formatRelativeTime(pipeline.lastRun)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Triggers:</span>
                  <div className="font-medium text-gray-900">
                    {pipeline.triggers.length}
                  </div>
                </div>
              </div>

              {/* Success Rate Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Pipeline Health</span>
                  <span className="font-medium text-gray-900">
                    {pipeline.successRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      pipeline.successRate >= 90
                        ? 'bg-green-500'
                        : pipeline.successRate >= 70
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${pipeline.successRate}%` }}
                  />
                </div>
              </div>

              {/* Triggers */}
              <div className="mt-3">
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Triggers:</span>
                  {pipeline.triggers.map(trigger => (
                    <span
                      key={trigger}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

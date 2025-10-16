import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import { HealthMetricsProps } from '../types/health.types';
import {
  getStatusColor,
  getMetricIcon,
  formatTimeAgo,
} from '../utils/health.utils';

export default function HealthMetrics({
  metrics,
  selectedMetric,
  onMetricSelect,
}: HealthMetricsProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />;
      default:
        return <MinusIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Key Health Metrics
        </h3>
        <select
          value={selectedMetric}
          onChange={e => onMetricSelect(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Metrics</option>
          {metrics.map(metric => (
            <option key={metric.name} value={metric.name}>
              {metric.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics
          .filter(
            metric => selectedMetric === 'all' || metric.name === selectedMetric
          )
          .map(metric => (
            <div
              key={metric.name}
              className="bg-white p-4 rounded-lg shadow border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() =>
                onMetricSelect(
                  metric.name === selectedMetric ? 'all' : metric.name
                )
              }
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getMetricIcon(metric.name)}</span>
                  <h4 className="text-sm font-medium text-gray-900">
                    {metric.name}
                  </h4>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(metric.status)}`}
                >
                  {metric.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </span>
                  <span className="text-sm text-gray-500">{metric.unit}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <span
                    className={`text-xs font-medium ${
                      metric.trend === 'up'
                        ? 'text-green-600'
                        : metric.trend === 'down'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {metric.trend}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    metric.status === 'healthy'
                      ? 'bg-green-500'
                      : metric.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(metric.value, 100)}%` }}
                />
              </div>

              <div className="text-xs text-gray-500">
                Updated {formatTimeAgo(metric.lastUpdated)}
              </div>
            </div>
          ))}
      </div>

      {metrics.filter(
        metric => selectedMetric === 'all' || metric.name === selectedMetric
      ).length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-500">No metrics available</p>
        </div>
      )}
    </div>
  );
}

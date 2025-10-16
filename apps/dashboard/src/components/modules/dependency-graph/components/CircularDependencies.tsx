import {
  ExclamationTriangleIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { CircularDependenciesProps } from '../types/dependency.types';

export default function CircularDependencies({
  cycles,
  packages,
  onPackageSelect,
}: CircularDependenciesProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
  };

  if (cycles.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Circular Dependencies
            </h3>
            <p className="text-sm text-gray-600">Dependency cycle analysis</p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="text-green-400 text-4xl mb-2">✅</div>
          <h4 className="text-green-800 font-medium mb-1">
            No Circular Dependencies!
          </h4>
          <p className="text-green-700 text-sm">
            Your dependency graph is clean and free of circular references.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Circular Dependencies
          </h3>
          <p className="text-sm text-gray-600">
            Found {cycles.length} circular dependency cycle
            {cycles.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {cycles.map((cycle, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getSeverityColor(cycle.severity)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {getSeverityIcon(cycle.severity)}
                </span>
                <span className="text-sm font-medium capitalize">
                  {cycle.severity} Severity
                </span>
              </div>
              <span className="text-xs opacity-75">
                {cycle.cycle.length} packages affected
              </span>
            </div>

            <div className="mb-3">
              <p className="text-sm mb-2">{cycle.impact}</p>
            </div>

            {/* Cycle Visualization */}
            <div className="bg-white bg-opacity-50 rounded-lg p-3">
              <div className="flex items-center flex-wrap gap-2">
                {cycle.cycle.map((packageId, idx) => (
                  <React.Fragment key={`${packageId}-${idx}`}>
                    <button
                      onClick={() => onPackageSelect(packageId)}
                      className="px-3 py-1 bg-white rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors border shadow-sm"
                    >
                      {packageId}
                    </button>
                    {idx < cycle.cycle.length - 1 && (
                      <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </React.Fragment>
                ))}
                {/* Arrow back to start */}
                {cycle.cycle.length > 1 && (
                  <>
                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 italic">
                      (cycles back to {cycle.cycle[0]})
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <h5 className="text-xs font-medium mb-1">Recommendation:</h5>
              <p className="text-xs opacity-90">
                {cycle.severity === 'high' &&
                  'Critical: Refactor immediately to break this cycle. Consider dependency inversion or splitting packages.'}
                {cycle.severity === 'medium' &&
                  'Important: Plan to refactor this cycle. Review package boundaries and extract common dependencies.'}
                {cycle.severity === 'low' &&
                  'Minor: Monitor this cycle. Consider if these packages could be merged or dependencies restructured.'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-red-600">
              {cycles.filter(c => c.severity === 'high').length}
            </div>
            <div className="text-xs text-gray-600">High Severity</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">
              {cycles.filter(c => c.severity === 'medium').length}
            </div>
            <div className="text-xs text-gray-600">Medium Severity</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600">
              {cycles.filter(c => c.severity === 'low').length}
            </div>
            <div className="text-xs text-gray-600">Low Severity</div>
          </div>
        </div>
      </div>
    </div>
  );
}

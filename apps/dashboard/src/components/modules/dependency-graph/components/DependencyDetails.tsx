import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { DependencyDetailsProps } from '../types/dependency.types';
import {
  getStatusColor,
  getTypeColor,
  getDependencyStatusColor,
} from '../utils/dependency.utils';

export default function DependencyDetails({
  package: pkg,
  packages,
  onClose,
}: DependencyDetailsProps) {
  if (!pkg) return null;

  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-80 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">{pkg.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Package Info */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(pkg.type)}`}
            >
              {pkg.type}
            </span>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}
            >
              {pkg.status}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Version: <span className="font-mono">{pkg.version}</span>
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Dependencies</h4>
            <span className="text-xs text-gray-500">
              ({pkg.dependencies.length})
            </span>
          </div>
          {pkg.dependencies.length > 0 ? (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {pkg.dependencies.map(depId => {
                const dep = packages.find(p => p.id === depId);
                return dep ? (
                  <div
                    key={depId}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="text-gray-600 truncate">{dep.name}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-400">
                        {dep.version}
                      </span>
                      <span
                        className={`${getDependencyStatusColor(depId, packages)}`}
                      >
                        {dep.status === 'healthy'
                          ? '✓'
                          : dep.status === 'warning'
                            ? '⚠'
                            : '✗'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div key={depId} className="text-sm text-gray-400 py-1">
                    {depId} (not found)
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-2">
              No dependencies
            </div>
          )}
        </div>

        {/* Dependents */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Dependents</h4>
            <span className="text-xs text-gray-500">
              ({pkg.dependents.length})
            </span>
          </div>
          {pkg.dependents.length > 0 ? (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {pkg.dependents.map(depId => {
                const dep = packages.find(p => p.id === depId);
                return dep ? (
                  <div
                    key={depId}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="text-gray-600 truncate">{dep.name}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-400">
                        {dep.version}
                      </span>
                      <span
                        className={`${getDependencyStatusColor(depId, packages)}`}
                      >
                        {dep.status === 'healthy'
                          ? '✓'
                          : dep.status === 'warning'
                            ? '⚠'
                            : '✗'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div key={depId} className="text-sm text-gray-400 py-1">
                    {depId} (not found)
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-500 text-center py-2">
              No dependents
            </div>
          )}
        </div>

        {/* Impact Analysis */}
        <div className="pt-2 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Impact Analysis
          </h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Direct dependencies:</span>
              <span className="font-medium">{pkg.dependencies.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Direct dependents:</span>
              <span className="font-medium">{pkg.dependents.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Risk level:</span>
              <span
                className={`font-medium ${
                  pkg.dependents.length > 5
                    ? 'text-red-600'
                    : pkg.dependents.length > 2
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }`}
              >
                {pkg.dependents.length > 5
                  ? 'High'
                  : pkg.dependents.length > 2
                    ? 'Medium'
                    : 'Low'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-gray-200">
          <Link
            to={`/packages/${pkg.name}`}
            className="block w-full text-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            View Package Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

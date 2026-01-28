import {
  CubeIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  LinkIcon,
} from '../../../../icons/heroicons';
import { GraphStatsProps } from '../types/dependency.types';

export default function GraphStats({ stats, packages }: GraphStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Total Packages */}
      <div className="bg-gray-100 p-4 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 rounded-lg">
            <CubeIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Packages</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalPackages}
            </p>
          </div>
        </div>
      </div>

      {/* Total Dependencies */}
      <div className="bg-blue-100 p-4 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 rounded-lg">
            <LinkIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Dependencies</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalDependencies}
            </p>
          </div>
        </div>
      </div>

      {/* Circular Dependencies */}
      <div className={`${
                stats.circularDependencies > 0
                  ? 'bg-red-100'
                  : 'bg-green-100'
              } p-4 rounded-lg shadow border`} >
        <div className="flex items-center">
          <div
            className={`p-2 rounded-lg ${
              stats.circularDependencies > 0 ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            <ExclamationTriangleIcon
              className={`w-6 h-6 ${
                stats.circularDependencies > 0
                  ? 'text-red-600'
                  : 'text-primary-600'
              }`}
            />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Circular Deps</p>
            <p
              className={`text-2xl font-semibold ${
                stats.circularDependencies > 0
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {stats.circularDependencies}
            </p>
          </div>
        </div>
      </div>

      {/* Max Depth */}
      <div className="bg-purple-100 p-4 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ChartBarIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Max Depth</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.maxDepth}
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="md:col-span-4 bg-white p-4 rounded-lg shadow border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Dependency Analysis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center bg-gray-100 p-2">
            <div className="text-2xl font-bold text-blue-600">
              {stats.leafPackages}
            </div>
            <div className="text-sm text-gray-600">Leaf Packages</div>
            <div className="text-xs text-gray-500">No dependencies</div>
          </div>

          <div className="text-center bg-gray-100 p-2">
            <div className="text-2xl font-bold text-green-600">
              {stats.rootPackages}
            </div>
            <div className="text-sm text-gray-600">Root Packages</div>
            <div className="text-xs text-gray-500">No dependents</div>
          </div>

          <div className="text-center bg-gray-100 p-2">
            <div className="text-2xl font-bold text-purple-600">
              {stats.avgDependencies}
            </div>
            <div className="text-sm text-gray-600">Avg Dependencies</div>
            <div className="text-xs text-gray-500">Per package</div>
          </div>

          <div className="text-center bg-gray-100 p-2">
            <div className="text-2xl font-bold text-orange-600">
              {packages.filter(p => p.status === 'healthy').length}
            </div>
            <div className="text-sm text-gray-600">Healthy Packages</div>
            <div className="text-xs text-gray-500">
              {Math.round(
                (packages.filter(p => p.status === 'healthy').length /
                  packages.length) *
                  100
              )}
              % of total
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '../../../../icons/heroicons';
import { PackageStats as StatsType } from '../types/packages.types';
import { CubeIcon } from '../../../../icons/heroicons';
interface PackageStatsProps {
  stats: StatsType;
}

export default function PackageStats({ stats }: PackageStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-gray-100 p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 rounded-lg">
            <CubeIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Packages</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.total}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-green-100 p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Healthy</p>
            <p className="text-2xl font-semibold text-gray-600">
              {stats.healthy}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-100 p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Warnings</p>
            <p className="text-2xl font-semibold text-gray-600">
              {stats.warnings}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-red-100 p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircleIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Errors</p>
            <p className="text-2xl font-semibold text-gray-600">
              {stats.errors}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

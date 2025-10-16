import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { PackageStats as StatsType } from '../types/packages.types';

interface PackageStatsProps {
  stats: StatsType;
}

export default function PackageStats({ stats }: PackageStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <div className="text-2xl">📦</div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Packages</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.total}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Healthy</p>
            <p className="text-2xl font-semibold text-green-600">
              {stats.healthy}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Warnings</p>
            <p className="text-2xl font-semibold text-yellow-600">
              {stats.warnings}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircleIcon className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Errors</p>
            <p className="text-2xl font-semibold text-red-600">
              {stats.errors}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { CubeIcon } from '@heroicons/react/24/outline';

interface PackageStats {
  total: number;
  apps: number;
  libs: number;
  tools: number;
  custom: number;
  totalDependencies: number;
}

interface StatsCardsProps {
  stats: PackageStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-2 bg-primary-100 rounded-lg">
            <CubeIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-caption font-medium">Total Packages</p>
            <p className="text-heading text-2xl">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-2 bg-secondary-100 rounded-lg">
            <span className="text-2xl">🚀</span>
          </div>
          <div className="ml-4">
            <p className="text-caption font-medium">Applications</p>
            <p className="text-heading text-2xl">{stats.apps}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-2 bg-accent-100 rounded-lg">
            <span className="text-2xl">📚</span>
          </div>
          <div className="ml-4">
            <p className="text-caption font-medium">Libraries</p>
            <p className="text-heading text-2xl">{stats.libs}</p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center">
          <div className="p-2 bg-info-100 rounded-lg">
            <span className="text-2xl">🔗</span>
          </div>
          <div className="ml-4">
            <p className="text-caption font-medium">Dependencies</p>
            <p className="text-heading text-2xl">{stats.totalDependencies}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  CubeIcon,
  RocketLaunchIcon,
  BuildingLibraryIcon,
  LinkIcon,
} from '../../../icons/heroicons';

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
      <div className="card p-6 bg-gray-100">
        <div className="flex items-center">
          <div className="p-2 rounded-lg">
            <CubeIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-caption font-medium">Total Packages</p>
            <p className="text-heading text-2xl">{stats.total}</p>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-green-100">
        <div className="flex items-center">
          <div className="p-2 bg-secondary-100 rounded-lg">
              <RocketLaunchIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-caption font-medium">Applications</p>
            <p className="text-heading text-2xl">{stats.apps}</p>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-yellow-100">
        <div className="flex items-center">
          <div className="p-2 bg-accent-100 rounded-lg">
              <BuildingLibraryIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div className="ml-4">
            <p className="text-caption font-medium">Libraries</p>
            <p className="text-heading text-2xl">{stats.libs}</p>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-blue-100">
        <div className="flex items-center">
          <div className="p-2 rounded-lg">
              <LinkIcon className="w-6 h-6 text-primary-600" />
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

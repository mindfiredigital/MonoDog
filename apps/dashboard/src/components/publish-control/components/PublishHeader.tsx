import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface PublishHeaderProps {
  packageCount: number;
  onNewRelease: () => void;
}

export default function PublishHeader({
  packageCount,
  onNewRelease,
}: PublishHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Publish Control</h1>
        <p className="text-gray-600 mt-1">
          Manage package releases and versioning across your monorepo (
          {packageCount} packages)
        </p>
      </div>
      <button
        onClick={onNewRelease}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
      >
        <CloudArrowUpIcon className="w-5 h-5" />
        <span>New Release</span>
      </button>
    </div>
  );
}

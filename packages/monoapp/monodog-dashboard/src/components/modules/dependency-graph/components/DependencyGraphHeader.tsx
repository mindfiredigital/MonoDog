import { ArrowPathIcon } from '../../../../icons/heroicons';

interface DependencyGraphHeaderProps {
  onRefresh?: () => void;
  loading?: boolean;
}

export default function DependencyGraphHeader({
  onRefresh,
  loading = false,
}: DependencyGraphHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dependency Graph</h1>
        <p className="text-gray-600 mt-1">
          Visualize package dependencies and relationships
        </p>
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className="hidden bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
        >
          <ArrowPathIcon
            className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
          />
          <span>Refresh</span>
        </button>
      )}
    </div>
  );
}

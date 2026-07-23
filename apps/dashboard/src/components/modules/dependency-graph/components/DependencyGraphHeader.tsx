import { ArrowPathIcon } from '../../../../icons/heroicons';
import type { DependencyGraphHeaderProps } from '../../../../types';

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
          className="btn-primary flex items-center space-x-2 transition-colors"
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

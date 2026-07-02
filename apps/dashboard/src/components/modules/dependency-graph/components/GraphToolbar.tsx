import {
  Squares2X2Icon,
  ListBulletIcon,
  InformationCircleIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '../../../../icons/heroicons';
import { GraphToolbarProps } from '../types/dependency.types';

export default function GraphToolbar({
  viewMode,
  onViewModeChange,
  layout,
  onLayoutChange,
  onToggleLegend,
  onZoomChange,
}: GraphToolbarProps) {
  return (
    <div className="card p-4 flex items-center justify-between">
      {/* View Mode Toggle */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">View:</span>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => onViewModeChange('graph')}
            className={`px-3 py-2 text-sm font-medium flex items-center space-x-1 ${
              viewMode === 'graph'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Squares2X2Icon className="w-4 h-4" />
            <span>Graph</span>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-2 text-sm font-medium flex items-center space-x-1 ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ListBulletIcon className="w-4 h-4" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Graph Layout Controls (only show in graph view) */}
      {viewMode === 'graph' && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Layout:</span>
            <select
              value={layout}
              onChange={e => onLayoutChange(e.target.value as any)}
              className="input-base w-40"
            >
              <option value="TB">Vertical</option>
              <option value="LR">Horizontal</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

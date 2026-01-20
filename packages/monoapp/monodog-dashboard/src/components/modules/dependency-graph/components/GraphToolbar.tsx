import {
  Squares2X2Icon,
  ListBulletIcon,
  InformationCircleIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from '@heroicons/react/24/outline';
import { GraphToolbarProps } from '../types/dependency.types';

export default function GraphToolbar({
  viewMode,
  onViewModeChange,
  layout,
  onLayoutChange,
  showLegend,
  onToggleLegend,
  zoomLevel,
  onZoomChange,
}: GraphToolbarProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow border flex items-center justify-between">
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
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="hierarchical">Hierarchical</option>
              <option value="circular">Circular</option>
              <option value="force">Force-Directed</option>
            </select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Zoom:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))}
                className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                disabled={zoomLevel <= 0.5}
              >
                <MagnifyingGlassMinusIcon className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => onZoomChange(Math.min(2, zoomLevel + 0.1))}
                className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                disabled={zoomLevel >= 2}
              >
                <MagnifyingGlassPlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend Toggle */}
      <button
        onClick={onToggleLegend}
        className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center space-x-1 transition-colors ${
          showLegend
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <InformationCircleIcon className="w-4 h-4" />
        <span>Legend</span>
      </button>
    </div>
  );
}

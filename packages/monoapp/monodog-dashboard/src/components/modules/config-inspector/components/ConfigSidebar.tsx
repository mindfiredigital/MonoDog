import { MagnifyingGlassIcon, FunnelIcon } from '../../../../icons/heroicons';
import { type ConfigSidebarProps } from '../types/config.types';
import {
  getTypeColor,
  formatFileSize,
  formatDate,
  getConfigIcon,
  getUniqueTypes,
} from '../utils/config.utils';
import { FolderIcon } from '../../../../icons/heroicons';

export default function ConfigSidebar({
  configs,
  selectedConfig,
  onConfigSelect,
  filters,
  onFiltersChange,
}: ConfigSidebarProps) {
  const availableTypes = getUniqueTypes(configs);

  return (
    <div className="bg-white rounded-lg shadow border h-full flex flex-col max-h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuration Files
        </h3>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search config files..."
            value={filters.search}
            onChange={e =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <select
              value={filters.type}
              onChange={e =>
                onFiltersChange({ ...filters, type: e.target.value })
              }
              className="flex-1 border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <select
            value={filters.status}
            onChange={e =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Files</option>
            <option value="standard">Standard Files</option>
            <option value="secrets">Files with Secrets</option>
          </select>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {configs.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-4xl mb-2"><FolderIcon className="w-6 h-6 text-primary-600" /></div>
            <p className="text-sm">No configuration files found</p>
          </div>
        ) : (
          <div className="p-2">
            {configs.map(config => (
              <button
                key={config.id}
                onClick={() => onConfigSelect(config.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedConfig === config.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getConfigIcon(config.name)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {config.name}
                      </p>
                      {config.hasSecrets && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          🔒
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-1">
                      {config.path}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getTypeColor(config.type)}`}
                      >
                        {config.type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatFileSize(config.size)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(config.lastModified)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {configs.length} file{configs.length !== 1 ? 's' : ''} found
        </div>
      </div>
    </div>
  );
}

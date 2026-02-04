import { MagnifyingGlassIcon, FunnelIcon } from '../../../../icons/heroicons';
import { PackageFilters } from '../types/packages.types';

interface SearchAndFilterProps {
  filters: PackageFilters;
  onFiltersChange: (filters: PackageFilters) => void;
  availableTypes: string[];
  availableStatuses: string[];
}

export default function SearchAndFilter({
  filters,
  onFiltersChange,
  availableTypes,
  availableStatuses,
}: SearchAndFilterProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search packages by name, description, or tags..."
            value={filters.search}
            onChange={e =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={filters.type}
              onChange={e =>
                onFiltersChange({ ...filters, type: e.target.value })
              }
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            {availableStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

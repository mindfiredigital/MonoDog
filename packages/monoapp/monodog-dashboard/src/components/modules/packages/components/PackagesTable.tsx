import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { Package, PackageSorting } from '../types/packages.types';
import {
  getStatusColor,
  getTypeColor,
  formatDate,
  formatVersion,
  getPackageTypeIcon,
} from '../utils/packages.utils';

interface PackagesTableProps {
  packages: Package[];
  sorting: PackageSorting;
  onSortChange: (sorting: PackageSorting) => void;
}

export default function PackagesTable({
  packages,
  sorting,
  onSortChange,
}: PackagesTableProps) {
  const handleSort = (field: PackageSorting['field']) => {
    const newOrder =
      sorting.field === field && sorting.order === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, order: newOrder });
  };

  const getSortIcon = (field: string) => {
    if (sorting.field !== field) return null;
    return sorting.order === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4" />
    ) : (
      <ArrowDownIcon className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Package</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('version')}
              >
                <div className="flex items-center space-x-1">
                  <span>Version</span>
                  {getSortIcon('version')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dependencies')}
              >
                <div className="flex items-center space-x-1">
                  <span>Dependencies</span>
                  {getSortIcon('dependencies')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('lastUpdated')}
              >
                <div className="flex items-center space-x-1">
                  <span>Last Updated</span>
                  {getSortIcon('lastUpdated')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Maintainers
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {packages.map(pkg => (
              <tr key={pkg.name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">
                      {getPackageTypeIcon(pkg.type)}
                    </div>
                    <div>
                      <Link
                        to={`/packages/${encodeURIComponent(pkg.name)}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        {pkg.name}
                      </Link>
                      <div className="text-sm text-gray-500">
                        {pkg.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-900">
                    {formatVersion(pkg.version)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(pkg.type)}`}
                  >
                    {pkg.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(pkg.status)}`}
                  >
                    {pkg.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {Object.keys(pkg.dependencies).length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {Object.keys(pkg.dependencies).slice(0, 3).join(', ')}
                      {Object.keys(pkg.dependencies).length > 3 &&
                        ` +${Object.keys(pkg.dependencies).length - 3} more`}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(pkg.lastUpdated)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex -space-x-1">
                    {pkg.maintainers.slice(0, 3).map((maintainer, index) => (
                      <div
                        key={maintainer}
                        className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-500 text-xs font-medium text-white"
                        title={maintainer}
                      >
                        {maintainer.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {pkg.maintainers.length > 3 && (
                      <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-300 text-xs font-medium text-gray-600">
                        +{pkg.maintainers.length - 3}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

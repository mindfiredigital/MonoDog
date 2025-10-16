import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { DependencyListProps } from '../types/dependency.types';
import {
  getStatusColor,
  getTypeColor,
  getPackageTypeIcon,
} from '../utils/dependency.utils';

export default function DependencyList({
  packages,
  selectedPackage,
  onPackageSelect,
  sortBy,
  sortOrder,
  onSortChange,
}: DependencyListProps) {
  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? (
      <ArrowUpIcon className="w-4 h-4" />
    ) : (
      <ArrowDownIcon className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Package Dependencies
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Click on a package to explore its dependencies and dependents
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
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
                onClick={() => handleSort('dependents')}
              >
                <div className="flex items-center space-x-1">
                  <span>Dependents</span>
                  {getSortIcon('dependents')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {packages.map(pkg => (
              <tr
                key={pkg.id}
                className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedPackage === pkg.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onPackageSelect(pkg.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">
                      {getPackageTypeIcon(pkg.type)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {pkg.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        v{pkg.version}
                      </div>
                    </div>
                  </div>
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

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {pkg.dependencies.length}
                    {pkg.dependencies.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {pkg.dependencies.slice(0, 3).join(', ')}
                        {pkg.dependencies.length > 3 &&
                          ` +${pkg.dependencies.length - 3} more`}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {pkg.dependents.length}
                    {pkg.dependents.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {pkg.dependents.slice(0, 3).join(', ')}
                        {pkg.dependents.length > 3 &&
                          ` +${pkg.dependents.length - 3} more`}
                      </div>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    to={`/packages/${pkg.name}`}
                    className="text-blue-600 hover:text-blue-500"
                    onClick={e => e.stopPropagation()}
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {packages.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-2">📦</div>
          <p className="text-gray-500">No packages found</p>
        </div>
      )}
    </div>
  );
}

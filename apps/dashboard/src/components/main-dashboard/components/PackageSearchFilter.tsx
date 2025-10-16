import React from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface PackageSearchFilterProps {
  searchTerm: string;
  selectedType: string;
  packageTypes: string[];
  onSearchChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

export default function PackageSearchFilter({
  searchTerm,
  selectedType,
  packageTypes,
  onSearchChange,
  onTypeChange,
}: PackageSearchFilterProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search packages..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="flex items-center space-x-2">
        <FunnelIcon className="w-5 h-5 text-gray-400" />
        <select
          value={selectedType}
          onChange={e => onTypeChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          {packageTypes.map(type => (
            <option key={type} value={type} className="capitalize">
              {type}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

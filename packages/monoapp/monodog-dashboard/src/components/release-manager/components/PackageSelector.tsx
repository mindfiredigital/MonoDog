/**
 * Package Selector Component
 * Allows users to select packages for release
 */

import React, { useState, useMemo } from 'react';

interface Package {
  name: string;
  version: string;
  private?: boolean;
  dependencies?: string[];
}

interface PackageSelectorProps {
  packages: Package[];
  onConfirm: (packages: Package[]) => void;
  loading?: boolean;
}

export default function PackageSelector({ packages, onConfirm, loading }: PackageSelectorProps) {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPackages = useMemo(
    () =>
      packages.filter(
        pkg =>
          !pkg.private &&
          pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [packages, searchTerm]
  );

  const togglePackage = (name: string) => {
    const newSelected = new Set(selectedNames);
    if (newSelected.has(name)) {
      newSelected.delete(name);
    } else {
      newSelected.add(name);
    }
    setSelectedNames(newSelected);
  };

  const toggleAll = () => {
    if (selectedNames.size === filteredPackages.length) {
      setSelectedNames(new Set());
    } else {
      setSelectedNames(new Set(filteredPackages.map(p => p.name)));
    }
  };

  const handleConfirm = () => {
    const selected = packages.filter(p => selectedNames.has(p.name));
    onConfirm(selected);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Select Packages</h2>
        <p className="text-gray-600">
          Choose which packages you want to release. You can select multiple packages.
        </p>
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search Packages</label>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by package name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Package List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700">
            Available Packages ({filteredPackages.length})
          </label>
          {filteredPackages.length > 0 && (
            <button
              onClick={toggleAll}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {selectedNames.size === filteredPackages.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg divide-y max-h-96 overflow-y-auto">
          {filteredPackages.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No packages found
            </div>
          ) : (
            filteredPackages.map(pkg => (
              <div
                key={pkg.name}
                className="p-4 hover:bg-gray-50 cursor-pointer transition"
                onClick={() => togglePackage(pkg.name)}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedNames.has(pkg.name)}
                    onChange={() => togglePackage(pkg.name)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{pkg.name}</p>
                    <p className="text-sm text-gray-500">Current: v{pkg.version}</p>
                  </div>
                  {pkg.dependencies && pkg.dependencies.length > 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {pkg.dependencies.length} deps
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleConfirm}
          disabled={selectedNames.size === 0 || loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Continue ({selectedNames.size} selected)
        </button>
      </div>
    </div>
  );
}

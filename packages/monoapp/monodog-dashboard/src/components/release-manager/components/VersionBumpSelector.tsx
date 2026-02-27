/**
 * Version Bump Selector Component
 * Allows users to select version bump types (major/minor/patch)
 */

import React, { useState } from 'react';
import { SelectedPackage } from '../ReleaseManager';

interface VersionBumpSelectorProps {
  packages: SelectedPackage[];
  onConfirm: (packages: SelectedPackage[]) => void;
  onBack: () => void;
}

const bumpDescriptions = {
  major: 'Breaking changes, incompatible API changes',
  minor: 'New features, backward compatible',
  patch: 'Bug fixes, patches, backward compatible',
};

export default function VersionBumpSelector({
  packages,
  onConfirm,
  onBack,
}: VersionBumpSelectorProps) {
  const [bumps, setBumps] = useState<Record<string, 'major' | 'minor' | 'patch'>>(
    packages.reduce((acc, pkg) => ({ ...acc, [pkg.name]: pkg.bumpType }), {})
  );

  const calculateNewVersion = (
    current: string,
    bumpType: 'major' | 'minor' | 'patch'
  ): string => {
    const parts = current.split('.').map(Number);
    if (bumpType === 'major') {
      return `${parts[0] + 1}.0.0`;
    } else if (bumpType === 'minor') {
      return `${parts[0]}.${parts[1] + 1}.0`;
    } else {
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
    }
  };

  const handleBumpChange = (packageName: string, bumpType: 'major' | 'minor' | 'patch') => {
    setBumps(prev => ({ ...prev, [packageName]: bumpType }));
  };

  const handleConfirm = () => {
    const updated: SelectedPackage[] = packages.map(pkg => ({
      ...pkg,
      bumpType: bumps[pkg.name],
      newVersion: calculateNewVersion(pkg.currentVersion, bumps[pkg.name]),
    }));
    onConfirm(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Select Version Bumps</h2>
        <p className="text-gray-600">
          Choose the version bump type for each package. This determines the new version number.
        </p>
      </div>

      {/* Bump Types Legend */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(bumpDescriptions) as [string, string][]).map(([type, desc]) => (
          <div key={type} className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900 capitalize mb-1">{type}</p>
            <p className="text-sm text-gray-600">{desc}</p>
          </div>
        ))}
      </div>

      {/* Packages Bump Selection */}
      <div className="space-y-4">
        {packages.map(pkg => (
          <div key={pkg.name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-gray-900">{pkg.name}</p>
                <p className="text-sm text-gray-500">Current: v{pkg.currentVersion}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">New Version:</p>
                <p className="text-lg font-bold text-primary-600">
                  v{calculateNewVersion(pkg.currentVersion, bumps[pkg.name])}
                </p>
              </div>
            </div>

            {/* Bump Type Selection */}
            <div className="grid grid-cols-3 gap-3">
              {(['major', 'minor', 'patch'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => handleBumpChange(pkg.name, type)}
                  className={`p-3 rounded-lg border-2 transition font-medium text-sm ${
                    bumps[pkg.name] === type
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>

            {/* Affected Dependencies */}
            {pkg.affectedDependencies.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  ℹ️ {pkg.affectedDependencies.length} dependent package(s)
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Will be auto-bumped when this package is released
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Back
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

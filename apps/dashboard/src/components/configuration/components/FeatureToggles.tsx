import React from 'react';
import { SettingsComponentProps } from '../types/config.types';
import { formatFeatureKey } from '../utils/config.utils';

export default function FeatureToggles({
  config,
  onConfigChange,
}: SettingsComponentProps) {
  const handleFeatureChange = (key: string, checked: boolean) => {
    onConfigChange({
      features: { ...config.features, [key]: checked },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Feature Toggles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(config.features || {}).map(([key, value]) => (
            <label key={key} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={value}
                onChange={e => handleFeatureChange(key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700 capitalize">
                {formatFeatureKey(key)}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Feature Descriptions
          </h4>
          <div className="text-xs text-blue-800 space-y-1">
            <div>
              <strong>Health Checks:</strong> Monitor package health and status
            </div>
            <div>
              <strong>CI Integration:</strong> Connect with CI/CD providers
            </div>
            <div>
              <strong>Dependency Graph:</strong> Visualize package dependencies
            </div>
            <div>
              <strong>Publish Control:</strong> Manage package publishing and
              versioning
            </div>
            <div>
              <strong>Search And Filter:</strong> Advanced search and filtering
              capabilities
            </div>
            <div>
              <strong>Configuration Inspector:</strong> View and edit
              configuration files
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

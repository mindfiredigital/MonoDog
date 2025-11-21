import React from 'react';
import { SettingsComponentProps } from '../types/config.types';
import { stringToArray, arrayToString } from '../utils/config.utils';

export default function MonorepoSettings({
  config,
  onConfigChange,
}: SettingsComponentProps) {
  const handleMonorepoChange = (field: string, value: any) => {
    onConfigChange({
      monorepo: { ...config.monorepo, [field]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Monorepo Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Structure Type
            </label>
            <select
              value={config.monorepo?.structure || 'standard'}
              onChange={e => handleMonorepoChange('structure', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="standard">Standard (apps/packages/libs)</option>
              <option value="custom">Custom Structure</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose your monorepo directory structure
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package Manager
            </label>
            <select
              value={config.monorepo?.packageManager || 'pnpm'}
              onChange={e =>
                handleMonorepoChange('packageManager', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pnpm">pnpm</option>
              <option value="npm">npm</option>
              <option value="yarn">Yarn</option>
              <option value="lerna">Lerna</option>
              <option value="nx">Nx</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Package manager used in your monorepo
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package Directories
            </label>
            <input
              type="text"
              value={arrayToString(config.monorepo?.directories)}
              onChange={e =>
                handleMonorepoChange(
                  'directories',
                  stringToArray(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="apps, packages, libs, services"
            />
            <p className="text-xs text-gray-500 mt-1">
              Directories containing packages
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ignore Patterns
            </label>
            <input
              type="text"
              value={arrayToString(config.monorepo?.ignorePatterns)}
              onChange={e =>
                handleMonorepoChange(
                  'ignorePatterns',
                  stringToArray(e.target.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="node_modules, dist, .git"
            />
            <p className="text-xs text-gray-500 mt-1">
              Patterns to ignore when scanning
            </p>
          </div>
        </div>

        {/* Configuration Preview */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Configuration Preview
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Structure:</span>
              <span className="ml-2 text-gray-600 capitalize">
                {config.monorepo?.structure || 'standard'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                Package Manager:
              </span>
              <span className="ml-2 text-gray-600">
                {config.monorepo?.packageManager || 'pnpm'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Directories:</span>
              <span className="ml-2 text-gray-600">
                {config.monorepo?.directories?.length || 0} configured
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">
                Ignore Patterns:
              </span>
              <span className="ml-2 text-gray-600">
                {config.monorepo?.ignorePatterns?.length || 0} patterns
              </span>
            </div>
          </div>
        </div>

        {/* Package Manager Specific Tips */}
        {config.monorepo?.packageManager && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              {config.monorepo.packageManager.toUpperCase()} Configuration Tips
            </h4>
            <div className="text-xs text-blue-800">
              {config.monorepo.packageManager === 'pnpm' && (
                <p>
                  Make sure you have a pnpm-workspace.yaml file in your root
                  directory.
                </p>
              )}
              {config.monorepo.packageManager === 'npm' && (
                <p>
                  Configure workspaces in your package.json with the
                  "workspaces" field.
                </p>
              )}
              {config.monorepo.packageManager === 'yarn' && (
                <p>
                  Ensure you have workspaces configured in your package.json.
                </p>
              )}
              {config.monorepo.packageManager === 'lerna' && (
                <p>
                  Make sure you have a lerna.json configuration file in your
                  root.
                </p>
              )}
              {config.monorepo.packageManager === 'nx' && (
                <p>
                  Ensure you have an nx.json configuration file in your
                  workspace root.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

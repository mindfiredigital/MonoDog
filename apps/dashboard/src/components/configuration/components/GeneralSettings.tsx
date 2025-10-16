import React from 'react';
import { SettingsComponentProps } from '../types/config.types';
import { stringToArray, arrayToString } from '../utils/config.utils';

export default function GeneralSettings({
  config,
  onConfigChange,
}: SettingsComponentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          General Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dashboard Title
            </label>
            <input
              type="text"
              value={config.title || ''}
              onChange={e => onConfigChange({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="My Monorepo Dashboard"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={config.description || ''}
              onChange={e => onConfigChange({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Visual management of our monorepo packages"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package Types
            </label>
            <input
              type="text"
              value={arrayToString(config.packageTypes)}
              onChange={e =>
                onConfigChange({ packageTypes: stringToArray(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="app, lib, tool, service"
            />
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated list of package types
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Fields
            </label>
            <input
              type="text"
              value={arrayToString(config.customFields)}
              onChange={e =>
                onConfigChange({ customFields: stringToArray(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="team, priority, environment"
            />
            <p className="text-xs text-gray-500 mt-1">
              Additional fields to display for packages
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

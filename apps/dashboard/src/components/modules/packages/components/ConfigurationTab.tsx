import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { PackageDetail } from '../types/packages.types';

interface ConfigurationTabProps {
  packageData: PackageDetail;
}

export default function ConfigurationTab({
  packageData,
}: ConfigurationTabProps) {
  return (
    <div className="py-6">
      {/* Scripts */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <DocumentTextIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Package Scripts</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(packageData.scripts).map(([scriptName, command]) => (
            <div
              key={scriptName}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {scriptName}
                </h4>
                <button className="text-blue-600 hover:text-blue-500 text-sm">
                  Run
                </button>
              </div>
              <code className="text-xs text-gray-600 bg-gray-100 p-2 rounded block overflow-x-auto">
                {command}
              </code>
            </div>
          ))}
        </div>

        {Object.keys(packageData.scripts).length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📝</div>
            <p className="text-gray-500">No scripts configured</p>
          </div>
        )}
      </div>

      {/* Package.json Preview */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Package Configuration
        </h3>

        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            {`{
  "name": "${packageData.name}",
  "version": "${packageData.version}",
  "description": "${packageData.description}",
  "license": "${packageData.license}",
  "repository": "${packageData.repository}",
  "scripts": {${Object.entries(packageData.scripts)
    .map(
      ([key, value]) => `
    "${key}": "${value}"`
    )
    .join(',')}
  },
  "dependencies": {${packageData.dependencies
    .map(
      dep => `
    "${dep.name}": "${dep.version}"`
    )
    .join(',')}
  },
  "devDependencies": {${packageData.devDependencies
    .map(
      dep => `
    "${dep.name}": "${dep.version}"`
    )
    .join(',')}
  }
}`}
          </pre>
        </div>

        <div className="mt-4 flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            Edit Configuration
          </button>
          <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">
            View Raw File
          </button>
        </div>
      </div>
    </div>
  );
}

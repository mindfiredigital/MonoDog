import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { StepContentProps } from '../types/setup.types';

export default function StepContent({
  step,
  onStepComplete,
}: StepContentProps) {
  const renderStepSpecificContent = () => {
    switch (step.id) {
      case 'monorepo-structure':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Quick Setup</h4>
              <p className="text-blue-800 text-sm mb-3">
                Choose your monorepo structure to get started quickly:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => onStepComplete(step.id)}
                  className="p-3 border border-blue-300 rounded-lg hover:bg-blue-100 text-left"
                >
                  <div className="font-medium text-blue-900">
                    Standard Structure
                  </div>
                  <div className="text-sm text-blue-700">
                    apps/, packages/, libs/
                  </div>
                </button>
                <button
                  onClick={() => onStepComplete(step.id)}
                  className="p-3 border border-blue-300 rounded-lg hover:bg-blue-100 text-left"
                >
                  <div className="font-medium text-blue-900">
                    Custom Structure
                  </div>
                  <div className="text-sm text-blue-700">
                    Define your own directories
                  </div>
                </button>
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Manual Configuration
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Root Directory
                  </label>
                  <input
                    type="text"
                    defaultValue="/path/to/monorepo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Manager
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="pnpm">pnpm</option>
                    <option value="npm">npm</option>
                    <option value="yarn">yarn</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'package-scanning':
        return (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">
                Automatic Discovery
              </h4>
              <p className="text-green-800 text-sm mb-3">
                We'll scan your monorepo for packages automatically:
              </p>
              <button
                onClick={() => onStepComplete(step.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
              >
                Start Package Scan
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Scans for package.json files
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Analyzes dependencies and relationships
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Detects build configurations
              </div>
            </div>
          </div>
        );

      case 'ci-integration':
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">
                Connect CI/CD
              </h4>
              <p className="text-purple-800 text-sm mb-3">
                Choose your CI/CD provider to monitor builds and deployments:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={() => onStepComplete(step.id)}
                  className="p-3 border border-purple-300 rounded-lg hover:bg-purple-100 text-left"
                >
                  <div className="font-medium text-purple-900">
                    GitHub Actions
                  </div>
                  <div className="text-sm text-purple-700">
                    Connect with GitHub
                  </div>
                </button>
                <button
                  onClick={() => onStepComplete(step.id)}
                  className="p-3 border border-purple-300 rounded-lg hover:bg-purple-100 text-left"
                >
                  <div className="font-medium text-purple-900">GitLab CI</div>
                  <div className="text-sm text-purple-700">
                    Connect with GitLab
                  </div>
                </button>
                <button
                  onClick={() => onStepComplete(step.id)}
                  className="p-3 border border-purple-300 rounded-lg hover:bg-purple-100 text-left"
                >
                  <div className="font-medium text-purple-900">Jenkins</div>
                  <div className="text-sm text-purple-700">
                    Connect with Jenkins
                  </div>
                </button>
                <button
                  onClick={() => onStepComplete(step.id)}
                  className="p-3 border border-purple-300 rounded-lg hover:bg-purple-100 text-left"
                >
                  <div className="font-medium text-purple-900">
                    Skip for now
                  </div>
                  <div className="text-sm text-purple-700">Configure later</div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'health-checks':
        return (
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-900 mb-2">
                Health Monitoring
              </h4>
              <p className="text-orange-800 text-sm mb-3">
                Configure how we monitor your package health:
              </p>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-orange-900">
                    Monitor build status
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-orange-900">
                    Track test coverage
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-orange-900">
                    Dependency vulnerability scanning
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-orange-900">
                    Performance monitoring
                  </span>
                </label>
              </div>
              <button
                onClick={() => onStepComplete(step.id)}
                className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 text-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="font-medium text-indigo-900 mb-2">
                Notification Preferences
              </h4>
              <p className="text-indigo-800 text-sm mb-3">
                Choose how you want to be notified about important events:
              </p>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span className="text-sm text-indigo-900">
                    Build failures
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-indigo-900">
                    Security vulnerabilities
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-indigo-900">
                    Dependency updates
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-indigo-900">
                    Performance degradation
                  </span>
                </label>
              </div>
              <button
                onClick={() => onStepComplete(step.id)}
                className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
              >
                Save Preferences
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Step content not found</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 overflow-y-auto max-h-[50vh]">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">{step.title}</h3>
        <p className="text-gray-600 mb-4">{step.description}</p>
      </div>

      {renderStepSpecificContent()}
    </div>
  );
}

import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { PackageDetail } from '../types/packages.types';

interface HealthMetricsTabProps {
  packageData: PackageDetail;
}

export default function HealthMetricsTab({
  packageData,
}: HealthMetricsTabProps) {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getBuildStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'running':
        return (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBuildStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLintStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-6">
      {/* Health Score Overview */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Health Score</h3>
          <div
            className={`text-3xl font-bold ${getHealthScoreColor(packageData.healthScore)}`}
          >
            {packageData.healthScore}%
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              packageData.healthScore >= 80
                ? 'bg-green-500'
                : packageData.healthScore >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${packageData.healthScore}%` }}
          />
        </div>

        <p className="text-sm text-gray-600">
          {packageData.healthScore >= 80 &&
            'Excellent health - package is in great condition'}
          {packageData.healthScore >= 60 &&
            packageData.healthScore < 80 &&
            'Good health - minor issues detected'}
          {packageData.healthScore < 60 &&
            'Needs attention - several issues require fixing'}
        </p>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Build Status */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Build Status</h4>
            {getBuildStatusIcon(packageData.buildStatus)}
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBuildStatusColor(packageData.buildStatus)}`}
            >
              {packageData.buildStatus}
            </span>
            <button className="text-blue-600 hover:text-blue-500 text-sm">
              View Logs
            </button>
          </div>
        </div>

        {/* Test Coverage */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Test Coverage</h4>
            <div
              className={`text-lg font-semibold ${
                packageData.testCoverage >= 80
                  ? 'text-green-600'
                  : packageData.testCoverage >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600'
              }`}
            >
              {packageData.testCoverage}%
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                packageData.testCoverage >= 80
                  ? 'bg-green-500'
                  : packageData.testCoverage >= 60
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${packageData.testCoverage}%` }}
            />
          </div>
        </div>

        {/* Lint Status */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Lint Status</h4>
            {packageData.lintStatus === 'pass' && (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
            {packageData.lintStatus === 'fail' && (
              <XCircleIcon className="w-5 h-5 text-red-500" />
            )}
            {packageData.lintStatus === 'warning' && (
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLintStatusColor(packageData.lintStatus)}`}
            >
              {packageData.lintStatus}
            </span>
            <button className="text-blue-600 hover:text-blue-500 text-sm">
              View Issues
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Detailed Metrics
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              Dependencies
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Dependencies:</span>
                <span className="font-medium">
                  {Object.keys(packageData.dependencies).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Outdated:</span>
                <span className="font-medium text-yellow-600">
                  {
                    packageData.dependencies.filter(
                      d => d.status === 'outdated'
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Major Updates Available:</span>
                <span className="font-medium text-red-600">
                  {
                    packageData.dependencies.filter(
                      d => d.status === 'major-update'
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">
              Code Quality
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Build Status:</span>
                <span
                  className={`font-medium ${
                    packageData.buildStatus === 'success'
                      ? 'text-green-600'
                      : packageData.buildStatus === 'failed'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                  }`}
                >
                  {packageData.buildStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Test Coverage:</span>
                <span className="font-medium">{packageData.testCoverage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lint Status:</span>
                <span
                  className={`font-medium ${
                    packageData.lintStatus === 'pass'
                      ? 'text-green-600'
                      : packageData.lintStatus === 'fail'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                  }`}
                >
                  {packageData.lintStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { ValidationPanelProps } from '../types/config.types';
import { getValidationColor } from '../utils/config.utils';

export default function ValidationPanel({
  validation,
  configName,
}: ValidationPanelProps) {
  const getValidationIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getOverallStatus = () => {
    if (validation.some(v => v.status === 'error')) return 'error';
    if (validation.some(v => v.status === 'warning')) return 'warning';
    return 'valid';
  };

  const overallStatus = getOverallStatus();
  const errorCount = validation.filter(v => v.status === 'error').length;
  const warningCount = validation.filter(v => v.status === 'warning').length;
  const validCount = validation.filter(v => v.status === 'valid').length;

  if (validation.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="text-center">
          <InformationCircleIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No Validation Results
          </h3>
          <p className="text-sm text-gray-500">
            Select a configuration file to see validation results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Validation Results
          </h3>
          <div className="flex items-center space-x-2">
            {getValidationIcon(overallStatus)}
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getValidationColor(overallStatus)}`}
            >
              {overallStatus.toUpperCase()}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Validation results for {configName}
        </p>
      </div>

      {/* Summary */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-600">{validCount}</div>
            <div className="text-xs text-gray-600">Valid</div>
          </div>
          <div>
            <div className="text-lg font-bold text-yellow-600">
              {warningCount}
            </div>
            <div className="text-xs text-gray-600">Warnings</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">{errorCount}</div>
            <div className="text-xs text-gray-600">Errors</div>
          </div>
        </div>
      </div>

      {/* Validation Items */}
      <div className="p-4">
        <div className="space-y-3">
          {validation.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                item.status === 'error'
                  ? 'border-red-200 bg-red-50'
                  : item.status === 'warning'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                {getValidationIcon(item.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.field}
                    </h4>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getValidationColor(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{item.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      {(errorCount > 0 || warningCount > 0) && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {errorCount > 0 && (
                <span className="text-red-600 font-medium">
                  {errorCount} error{errorCount > 1 ? 's' : ''} need attention
                </span>
              )}
              {warningCount > 0 && errorCount === 0 && (
                <span className="text-yellow-600 font-medium">
                  {warningCount} warning{warningCount > 1 ? 's' : ''} to review
                </span>
              )}
            </div>
            <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

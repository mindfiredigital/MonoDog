import React from 'react';
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { HealthAlertsProps } from '../types/health.types';
import { formatTimeAgo } from '../utils/health.utils';

export default function HealthAlerts({
  alerts,
  onAlertDismiss,
}: HealthAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertBgColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getAlertTextColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Health Alerts</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-400 text-4xl mb-2">✅</div>
          <h4 className="text-green-800 font-medium mb-1">All Clear!</h4>
          <p className="text-green-700 text-sm">
            No health alerts at this time. Your monorepo is running smoothly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Health Alerts</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          {alerts.length} alert{alerts.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${getAlertBgColor(alert.type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4
                      className={`text-sm font-medium ${getAlertTextColor(alert.type)}`}
                    >
                      {alert.title}
                    </h4>
                    {alert.packageName && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {alert.packageName}
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm ${getAlertTextColor(alert.type)} opacity-90`}
                  >
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatTimeAgo(alert.timestamp)}
                  </p>
                </div>
              </div>

              {onAlertDismiss && (
                <button
                  onClick={() => onAlertDismiss(alert.id)}
                  className="text-gray-400 hover:text-gray-600 ml-4"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Alert Summary
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-red-600 font-semibold">
              {alerts.filter(a => a.type === 'error').length}
            </div>
            <div className="text-gray-600">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-600 font-semibold">
              {alerts.filter(a => a.type === 'warning').length}
            </div>
            <div className="text-gray-600">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-semibold">
              {alerts.filter(a => a.type === 'info').length}
            </div>
            <div className="text-gray-600">Info</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import {
  XMarkIcon,
  StopIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { BuildDetailsProps } from '../types/ci.types';
import {
  getStatusColor,
  getStageStatusColor,
  formatDuration,
  formatDateTime,
  getShortCommitHash,
  getStageIcon,
} from '../utils/ci.utils';

export default function BuildDetails({
  build,
  onClose,
  onCancel,
  onRetry,
}: BuildDetailsProps) {
  if (!build) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'running':
        return (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        );
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <StopIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getStatusIcon(build.status)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {build.packageName} Build
              </h2>
              <p className="text-sm text-gray-600">
                {build.branch} • {getShortCommitHash(build.commit)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {build.status === 'running' && onCancel && (
              <button
                onClick={() => onCancel(build.id)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
              >
                <StopIcon className="w-4 h-4 mr-1" />
                Cancel
              </button>
            )}
            {(build.status === 'failed' || build.status === 'cancelled') &&
              onRetry && (
                <button
                  onClick={() => onRetry(build.id)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  Retry
                </button>
              )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Build Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Build Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(build.status)}`}
                    >
                      {build.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span className="font-medium">
                      {formatDateTime(build.startTime)}
                    </span>
                  </div>
                  {build.endTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ended:</span>
                      <span className="font-medium">
                        {formatDateTime(build.endTime)}
                      </span>
                    </div>
                  )}
                  {build.duration && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {formatDuration(build.duration)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Triggered by:</span>
                    <span className="font-medium">{build.triggeredBy}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Artifacts
                </h3>
                {build.artifacts.length > 0 ? (
                  <div className="space-y-1">
                    {build.artifacts.map((artifact, index) => (
                      <div key={index} className="text-sm">
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-500 font-medium"
                        >
                          {artifact}
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No artifacts generated
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Build Stages */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Build Stages
            </h3>
            <div className="space-y-4">
              {build.stages.map((stage, index) => (
                <div
                  key={stage.name}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getStageIcon(stage.name)}
                      </span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {stage.name}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStageStatusColor(stage.status)}`}
                          >
                            {stage.status}
                          </span>
                          {stage.duration && (
                            <span className="text-xs text-gray-500">
                              {formatDuration(stage.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Step {index + 1} of {build.stages.length}
                    </div>
                  </div>

                  {/* Stage Logs */}
                  {stage.logs && stage.logs.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-700 mb-2">
                        Logs
                      </h5>
                      <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono max-h-32 overflow-y-auto">
                        {stage.logs.map((log, logIndex) => (
                          <div key={logIndex} className="mb-1">
                            {log}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

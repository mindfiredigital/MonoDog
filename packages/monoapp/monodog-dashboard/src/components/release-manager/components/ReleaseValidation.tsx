/**
 * Release Validation Component
 * Validates release readiness before publishing
 */

import React from 'react';
import { ValidationResult, SelectedPackage } from '../ReleaseManager';
import { CheckIcon, XMarkIcon } from '../../../icons';

interface ReleaseValidationProps {
  validation: ValidationResult;
  packages: SelectedPackage[];
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

export default function ReleaseValidation({
  validation,
  packages,
  onConfirm,
  onBack,
  loading,
}: ReleaseValidationProps) {
  const checks = [
    { name: 'User Permissions', passed: validation.checks.permissions },
    { name: 'Working Tree Clean', passed: validation.checks.workingTreeClean },
    { name: 'CI Tests Passing', passed: validation.checks.ciPassing },
    { name: 'Version Available on npm', passed: validation.checks.versionAvailable },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 4: Validate Release</h2>
        <p className="text-gray-600">
          Checking if the release is safe to proceed. All checks must pass.
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg ${validation.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
          <p className={`font-medium ${validation.isValid ? 'text-green-900' : 'text-red-900'}`}>
            {validation.isValid ? 'Ready to Release' : 'Not Ready'}
          </p>
          <p className={`text-sm mt-1 ${validation.isValid ? 'text-green-700' : 'text-red-700'}`}>
            {validation.isValid
              ? 'All checks passed. Safe to proceed.'
              : `${validation.errors.length} error(s) need resolution`}
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="font-medium text-blue-900">Release Summary</p>
          <p className="text-sm text-blue-700 mt-1">
            {packages.length} package(s) will be released
          </p>
        </div>
      </div>

      {/* Validation Checks */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Pre-release Checks</h3>
        <div className="space-y-3">
          {checks.map((check, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                check.passed ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white p-1 ${
                  check.passed ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {check.passed ? <CheckIcon></CheckIcon> : <XMarkIcon></XMarkIcon>}
              </div>
              <span
                className={`font-medium ${
                  check.passed ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {check.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-red-900 mb-4">Errors</h3>
          <div className="space-y-2">
            {validation.errors.map((error, idx) => (
              <p key={idx} className="text-red-700 text-sm">
                • {error}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-bold text-yellow-900 mb-4">Warnings</h3>
          <div className="space-y-2">
            {validation.warnings.map((warning, idx) => (
              <p key={idx} className="text-yellow-700 text-sm">
                {warning}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
          disabled={loading}
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={!validation.isValid || loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Publishing...' : 'Confirm & Publish'}
        </button>
      </div>
    </div>
  );
}

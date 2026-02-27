/**
 * Changeset Preview Component
 * Allows users to review and create changesets
 */

import React, { useState } from 'react';
import { SelectedPackage } from '../ReleaseManager';
import { ArrowLongRightIcon } from '../../../icons';
import { CHANGESET_SUMMARY, SUMMARY_LIMIT } from '../../../constants/messages'
interface ChangesetPreviewProps {
  packages: SelectedPackage[];
  existingChangesets: any[];
  onConfirm: (summary: string) => void;
  onBack: () => void;
  loading?: boolean;
}

export default function ChangesetPreview({
  packages,
  existingChangesets,
  onConfirm,
  onBack,
  loading,
}: ChangesetPreviewProps) {
  const [summary, setSummary] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const validateSummary = () => {
    const newErrors: string[] = [];
    if (!summary.trim()) {
      newErrors.push('Please enter a changelog summary');
    }
    if (summary.trim().length < 10) {
      newErrors.push(SUMMARY_LIMIT);
    }
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleConfirm = () => {
    if (validateSummary()) {
      onConfirm(summary);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 3: Preview Changeset</h2>
        <p className="text-gray-600">
          Review the changeset that will be created. Enter a summary of the changes.
        </p>
      </div>

      {/* Changeset Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Changelog Summary
        </label>
        <textarea
          value={summary}
          onChange={e => {setSummary(e.target.value); validateSummary();}}
          placeholder={CHANGESET_SUMMARY}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
        />
        {errors.length > 0 && (
          <div className="mt-2 space-y-1">
            {errors.map((error, idx) => (
              <p key={idx} className="text-sm text-red-600">
                {error}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Packages Overview */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Packages to Release</h3>
        <div className="space-y-3">
          {packages.map(pkg => (
            <div key={pkg.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{pkg.name}</p>
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  {pkg.currentVersion} <ArrowLongRightIcon></ArrowLongRightIcon> {pkg.newVersion}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {pkg.bumpType.charAt(0).toUpperCase() + pkg.bumpType.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conflict Warning */}
      {existingChangesets.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">Unpublished Changesets</p>
          <p className="text-yellow-700 text-sm mt-1">
            There are {existingChangesets.length} existing unpublished changeset(s).
            Creating new ones will accumulate until published.
          </p>
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
          onClick={handleConfirm}
          disabled={loading || errors.length > 0}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Processing...' : 'Continue to Validation'}
        </button>
      </div>
    </div>
  );
}

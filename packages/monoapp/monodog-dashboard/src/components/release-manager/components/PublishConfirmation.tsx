/**
 * Publish Confirmation Component
 * Shows confirmation of successful release
 */

import React from 'react';
import { SelectedPackage } from '../ReleaseManager';
import { ArrowLongRightIcon } from '../../../icons';

interface PublishConfirmationProps {
  packages: SelectedPackage[];
  summary: string;
  onReset: () => void;
}

export default function PublishConfirmation({
  packages,
  summary,
  onReset,
}: PublishConfirmationProps) {
  const releaseDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Release Initiated!</h2>
        <p className="text-gray-600 text-lg mb-4">
          Changeset created and publishing workflow started for {packages.length} package(s)
        </p>
        <p className="text-gray-500 text-sm">Initiated on {releaseDate}</p>
      </div>

      {/* Publishing Status Information */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">What Happens Next</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0 text-blue-600 mt-0.5">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-blue-900">1. Changeset Created</p>
              <p className="text-sm text-blue-700 mt-1">A changeset has been created with your release information</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0 text-blue-600 mt-0.5">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-blue-900">2. Publishing Workflow Started</p>
              <p className="text-sm text-blue-700 mt-1">GitHub Actions workflow has been triggered to publish your packages</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="flex-shrink-0 text-blue-600 mt-0.5">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-blue-900">3. Monitor Progress</p>
              <p className="text-sm text-blue-700 mt-1">Check GitHub Actions for the workflow status and npm registry for package updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Released Packages */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Packages Released</h3>
        <div className="space-y-2">
          {packages.map(pkg => (
            <div key={pkg.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{pkg.name}</p>
                <p className="flex items-center gap-2 text-sm text-gray-500">
                  v{pkg.currentVersion} <ArrowLongRightIcon></ArrowLongRightIcon> v{pkg.newVersion}
                </p>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {pkg.bumpType.charAt(0).toUpperCase() + pkg.bumpType.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Changelog */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Changelog Summary</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700 whitespace-pre-wrap">{summary}</p>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>Changeset created and committed</li>
          <li>Package versions updated</li>
          <li>Release pipeline triggered</li>
          <li>GitHub release created (in progress)</li>
          <li>npm registry will be updated shortly</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onReset}
          className="px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
        >
          Release Another Package
        </button>
      </div>

      {/* Links */}
      <div className="border-t pt-6 flex gap-4 justify-center">
        <a href="#" className="flex items-center gap-2 gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
          View Release on GitHub <ArrowLongRightIcon></ArrowLongRightIcon>
        </a>
        <a href="#" className="flex items-center gap-2 gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm">
          View on npm <ArrowLongRightIcon></ArrowLongRightIcon>
        </a>
      </div>
    </div>
  );
}

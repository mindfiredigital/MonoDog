import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClockIcon, CalendarIcon, ArrowLeftIcon } from '../../icons/heroicons';
import { useAuth } from '../../services/auth-context';
import apiClient from '../../services/api';
import { DASHBOARD_API_ENDPOINTS } from '../../constants/api-config';
import { monorepoService } from '../../services/monorepoService';

export default function CreateSchedulePage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const navigate = useNavigate();

  const [packages, setPackages] = useState<
    Array<{ name: string; version: string }>
  >([]);
  const [packageName, setPackageName] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      if (!hasPermission('maintain')) {
        navigate('/release/scheduled');
        return;
      }
      fetchPackages();
    }
  }, [isAuthenticated]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const packagesRes = await apiClient.get(
        DASHBOARD_API_ENDPOINTS.PUBLISH.PACKAGES
      );
      if (packagesRes.success) {
        setPackages((packagesRes.data as any)?.packages || []);
      } else {
        const fallbackRes = await apiClient.get(
          DASHBOARD_API_ENDPOINTS.PACKAGES.LIST
        );
        if (fallbackRes.success) {
          setPackages((fallbackRes.data as any) || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch packages:', err);
      setError('Failed to load packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const [publishType, setPublishType] = useState<'patch' | 'minor' | 'major'>(
    'patch'
  );

  const selectedPackage = packages.find(p => p.name === packageName);
  const currentVersion = selectedPackage?.version || 'unknown';

  let nextVersion = currentVersion;
  if (currentVersion !== 'unknown') {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    if (!isNaN(major) && !isNaN(minor) && !isNaN(patch)) {
      if (publishType === 'major') nextVersion = `${major + 1}.0.0`;
      else if (publishType === 'minor') nextVersion = `${major}.${minor + 1}.0`;
      else nextVersion = `${major}.${minor}.${patch + 1}`;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName || !nextVersion || !scheduledAt) {
      setError('All fields are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await monorepoService.scheduleRelease({
        packageName,
        releaseVersion: nextVersion,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      // Redirect back to scheduled releases on success
      navigate('/release/scheduled');
    } catch (err: any) {
      setError(err.message || 'Failed to schedule release');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Please log in to schedule a release.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/release/scheduled')}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-gray-500" />
            Schedule New Release
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Select a package and set a date for an automated future release.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-100 rounded-md" />
            <div className="h-10 bg-gray-100 rounded-md" />
            <div className="h-10 bg-gray-100 rounded-md w-1/2" />
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Package
                  </label>
                  <select
                    value={packageName}
                    onChange={e => setPackageName(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="" disabled>
                      Select a package
                    </option>
                    {packages.map(pkg => (
                      <option key={pkg.name} value={pkg.name}>
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPackage && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Target Version
                    </label>
                    <div className="flex items-center space-x-2 mt-1 bg-gray-50 border border-gray-200 rounded-md p-2 h-10">
                      <span className="text-sm text-gray-500">
                        v{currentVersion}
                      </span>
                      <span className="text-gray-400">&rarr;</span>
                      <span className="text-sm font-bold text-gray-900">
                        v{nextVersion}
                      </span>
                      <select
                        value={publishType}
                        onChange={e => setPublishType(e.target.value as any)}
                        className="ml-2 text-xs rounded-full font-medium bg-blue-100 text-blue-800 border-none focus:ring-0 cursor-pointer"
                      >
                        <option value="patch">patch</option>
                        <option value="minor">minor</option>
                        <option value="major">major</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1 md:w-1/2">
                <label className="block text-sm font-medium text-gray-700">
                  Date & Time
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ClockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/release/scheduled')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !packageName || !scheduledAt}
                  className="bg-primary-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

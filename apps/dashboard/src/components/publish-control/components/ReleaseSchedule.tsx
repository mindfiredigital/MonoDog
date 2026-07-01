import { useState } from 'react';
import { CalendarIcon, ClockIcon } from '../../../icons/heroicons';
import { Package, Release } from '../types/publish.types';
import { getStatusColor } from '../utils/publish.utils';

interface ReleaseScheduleProps {
  releases: Release[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  packages: Package[];
  onSchedule: (data: {
    packageName: string;
    releaseVersion: string;
    scheduledAt: string;
  }) => Promise<void>;
}

export default function ReleaseSchedule({
  releases,
  selectedStatus,
  onStatusChange,
  packages,
  onSchedule,
}: ReleaseScheduleProps) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [packageName, setPackageName] = useState(packages[0]?.name || '');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-calculate the next version based on the selected package version bump type
  const selectedPackage = packages.find(p => p.name === packageName);
  const nextVersion = selectedPackage?.nextVersion || 'unknown';
  const currentVersion = selectedPackage?.currentVersion || 'unknown';
  const publishType = selectedPackage?.publishType || 'patch';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageName || !nextVersion || !scheduledAt) {
      setError('All fields are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSchedule({
        packageName,
        releaseVersion: nextVersion,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      setIsScheduling(false);
      setScheduledAt('');
    } catch (err: any) {
      setError(err.message || 'Failed to schedule release');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-medium text-gray-900">
              Release Schedule
            </h3>
            {!isScheduling && (
              <button
                onClick={() => setIsScheduling(true)}
                className="btn-primary flex items-center space-x-2"
              >
                Schedule Release
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Filter by status:</span>
            <select
              value={selectedStatus}
              onChange={e => onStatusChange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {isScheduling && (
          <div className="card p-5 mb-8 bg-neutral-50 border-neutral-200">
            <h4 className="text-heading text-md font-semibold mb-4">
              Schedule New Release
            </h4>
            {error && (
              <div className="mb-4 rounded-lg bg-error-50 p-4 text-sm text-error-800 border border-error-200">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Package
                  </label>
                  <select
                    value={packageName}
                    onChange={e => setPackageName(e.target.value)}
                    className="input-base w-full bg-white"
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
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Target Version
                  </label>
                  <div className="flex items-center space-x-2 mt-1 bg-white border border-neutral-200 rounded-lg p-2 shadow-soft">
                    <span className="text-sm text-neutral-500">
                      v{currentVersion}
                    </span>
                    <span className="text-neutral-400">→</span>
                    <span className="text-sm font-bold text-neutral-900">
                      v{nextVersion}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        publishType === 'major'
                          ? 'badge-error'
                          : publishType === 'minor'
                            ? 'badge-info'
                            : 'badge-success'
                      }`}
                    >
                      {publishType}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    className="input-base w-full bg-white"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduling(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {releases.map(release => (
            <div
              key={release.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {release.packageName} v{release.version}
                    </div>
                    <div className="text-sm text-gray-500">
                      by {release.author}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(release.status)}`}
                  >
                    {release.status}
                  </span>
                  <div className="text-sm text-gray-500 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    {release.scheduledFor}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                {release.changelog}
              </div>
            </div>
          ))}
          {releases.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No releases scheduled.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

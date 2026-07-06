import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  ArrowLeftIcon,
} from '../../icons/heroicons';
import { useAuth } from '../../services/auth-context';
import { monorepoService } from '../../services/monorepoService';
import type { Release } from '../publish-control/types/publish.types';
import { getStatusColor } from '../publish-control/utils/publish.utils';

export default function ScheduledReleasesPage() {
  const { isAuthenticated, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [scheduledReleases, setScheduledReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchScheduledData();
    }
  }, [isAuthenticated]);

  const fetchScheduledData = async () => {
    try {
      setLoading(true);
      const scheduledData = await monorepoService.getScheduledReleases();
      const mappedReleases = scheduledData.map((rel: any) => ({
        id: rel.id,
        packageName: rel.packageName,
        version: rel.releaseVersion,
        author: rel.triggeredBy || 'System',
        status: rel.status,
        scheduledFor: new Date(rel.scheduledAt).toLocaleString(),
        changelog: 'Scheduled release',
      }));
      setScheduledReleases(mappedReleases);
    } catch (err) {
      console.error('Failed to fetch scheduled releases', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Please log in to access scheduled releases.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate('/release')}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClockIcon className="h-6 w-6 text-gray-500" />
            Scheduled Releases
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage your upcoming package releases
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasPermission('maintain') && (
            <button
              onClick={() => navigate('/release/schedule/new')}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-primary-100" />
              <span>Schedule</span>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : scheduledReleases.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No scheduled releases
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't scheduled any upcoming releases yet.
              </p>
              {hasPermission('maintain') && (
                <button
                  onClick={() => navigate('/release/schedule/new')}
                  className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Create one now &rarr;
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledReleases.map(release => (
                <div
                  key={release.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <CalendarIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {release.packageName}{' '}
                          <span className="text-gray-500 font-normal">
                            v{release.version}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          Scheduled by {release.author}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          release.status
                        )}`}
                      >
                        {release.status}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 flex items-center justify-end gap-1">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          {release.scheduledFor}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

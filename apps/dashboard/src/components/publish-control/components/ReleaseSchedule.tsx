import React from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Release } from '../types/publish.types';
import { getStatusColor } from '../utils/publish.utils';

interface ReleaseScheduleProps {
  releases: Release[];
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export default function ReleaseSchedule({
  releases,
  selectedStatus,
  onStatusChange,
}: ReleaseScheduleProps) {
  const mockReleases: Release[] = [
    {
      id: '1',
      packageName: 'dashboard',
      version: '1.0.1',
      status: 'scheduled',
      scheduledFor: '2024-01-16 10:00 AM',
      changelog: 'Bug fixes and performance improvements',
      author: 'team-frontend',
    },
    {
      id: '2',
      packageName: 'backend',
      version: '1.3.0',
      status: 'in-progress',
      scheduledFor: '2024-01-16 11:00 AM',
      startedAt: '2024-01-16 11:05 AM',
      changelog: 'New API endpoints and enhanced security',
      author: 'team-backend',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Release Schedule
          </h3>
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
        <div className="space-y-4">
          {mockReleases.map(release => (
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
        </div>
      </div>
    </div>
  );
}

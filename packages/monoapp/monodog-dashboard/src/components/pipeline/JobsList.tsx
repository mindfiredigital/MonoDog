import React from 'react';
import {
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '../../icons/index';

import type { JobsListProps } from '../../types';

function getStatusIcon(
  status: string,
  conclusion: string | null,
  isUpdating: boolean = false
) {
  if (isUpdating) {
    return <ClockIcon className="h-6 w-6 text-yellow-500 animate-spin" />;
  }
  if (status === 'completed') {
    if (conclusion === 'success') {
      return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
    } else if (conclusion === 'failure') {
      return <ExclamationCircleIcon className="h-6 w-6 text-red-600" />;
    } else if (conclusion === 'cancelled') {
      return <XCircleIcon className="h-6 w-6 text-gray-600" />;
    } else if (conclusion === 'skipped') {
      return <ClockIcon className="h-6 w-6 text-gray-600" />;
    }
  }
  if (status === 'in_progress' || status === 'queued') {
    return <ClockIcon className="h-6 w-6 text-blue-600" />;
  }
  return <ClockIcon className="h-6 w-6 text-gray-600" />;
}

export default function JobsList({
  jobs,
  selectedJob,
  onSelectJob,
}: JobsListProps) {
  return (
    <>
      {jobs.map(job => {
        const jobDuration =
          job.startedAt && job.completedAt
            ? Math.round(
                (new Date(job.completedAt).getTime() -
                  new Date(job.startedAt).getTime()) /
                  1000
              )
            : 0;

        return (
          <div
            key={job.id}
            className={`rounded-lg border transition-colors ${
              selectedJob?.id === job.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <button
              onClick={() => onSelectJob(job)}
              className="w-full text-left p-3"
            >
              <div className="flex items-start gap-2">
                {getStatusIcon(job.status, job.conclusion)}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-gray-900 truncate">
                    {job.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {job.status} • {jobDuration}s
                  </p>
                </div>
              </div>
            </button>
          </div>
        );
      })}
    </>
  );
}

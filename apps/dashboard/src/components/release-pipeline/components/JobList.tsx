import type { PipelineWorkflowJob } from '../../../types/pipeline.types';
import { formatStatus, formatDuration } from '../utils/release.utils';
import { statusTone } from "../../../constants/messages"
import { JobListProps } from '../types/job-logs.types';

export function JobList({ jobs, selectedJobId, setSelectedJobId }: JobListProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Jobs</h3>
        <span className="text-xs text-neutral-500">{jobs.length} total</span>
      </div>
      <div className="space-y-3">
        {jobs.map((job: PipelineWorkflowJob) => (
          <button
            type="button"
            key={job.id}
            onClick={() => setSelectedJobId(job.id)}
            className={`w-full rounded-2xl border p-4 text-left transition ${selectedJobId === job.id
              ? 'border-primary-400 bg-primary-50'
              : 'border-neutral-200 hover:border-primary-200 hover:bg-neutral-50'
              }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-neutral-900">{job.name}</p>
              <span
                className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusTone[formatStatus(job.status, job.conclusion)] ||
                  statusTone[job.status]
                  }`}
              >
                {formatStatus(job.status, job.conclusion)}
              </span>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              {job.steps.length} steps · {formatDuration(job.started_at, job.completed_at)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

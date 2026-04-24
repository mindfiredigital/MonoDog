import { formatStatus, formatDuration, renderAnsiSegments } from '../utils/release.utils';
import { JobLogsProps } from '../types/job-logs.types';

export function JobLogs({
  selectedJob,
  selectedLogs,
  expandedSteps,
  setExpandedSteps,
  fetchJobLogs,
  logsLoading,
}: JobLogsProps) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft">
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {selectedJob.name}
          </h3>
          <p className="text-sm text-neutral-600">
            Streamed logs with timestamps and step hierarchy
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedJob.html_url && (
            <a
              href={selectedJob.html_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary-400 hover:text-primary-700"
            >
              GitHub fallback
            </a>
          )}
          <button
            type="button"
            onClick={() => fetchJobLogs(true)}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary-400 hover:text-primary-700"
          >
            {logsLoading ? 'Refreshing...' : 'Refresh logs'}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {selectedLogs?.steps.map(step => (
          <div
            key={step.stepNumber}
            className="overflow-hidden rounded-2xl border border-neutral-200"
          >
            <button
              type="button"
              onClick={() =>
                setExpandedSteps(current => {
                  const next = new Set(current);
                  if (next.has(step.stepNumber)) {
                    next.delete(step.stepNumber);
                  } else {
                    next.add(step.stepNumber);
                  }
                  return next;
                })
              }
              className="flex w-full items-center justify-between bg-neutral-50 px-4 py-3 text-left"
            >
              <div>
                <p className="font-semibold text-neutral-900">
                  Step {step.stepNumber}: {step.stepName}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatStatus(step.status, step.conclusion)} ·{' '}
                  {formatDuration(step.startedAt, step.completedAt)}
                </p>
              </div>
              <span className="text-sm text-neutral-500">
                {expandedSteps.has(step.stepNumber) ? 'Hide' : 'Show'}
              </span>
            </button>

            {expandedSteps.has(step.stepNumber) && (
              <div className="max-h-[420px] overflow-auto bg-neutral-950 px-4 py-3 font-mono text-xs text-neutral-100">
                {step.logs.length === 0 && (
                  <div className="text-neutral-500">Waiting for log output...</div>
                )}
                {step.logs.map(log => (
                  <div
                    key={`${step.stepNumber}-${log.lineNumber}-${log.timestamp}`}
                    className="grid grid-cols-[180px_minmax(0,1fr)] gap-4 border-b border-white/5 py-1 last:border-b-0"
                  >
                    <span className="text-cyan-300">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="whitespace-pre-wrap break-words">
                      {renderAnsiSegments(log.ansiContent)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {selectedLogs && selectedLogs.hasMoreLogs && (
          <button
            type="button"
            onClick={() => fetchJobLogs(false)}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary-400 hover:text-primary-700"
          >
            Load more logs
          </button>
        )}
      </div>
    </div>
  );
}

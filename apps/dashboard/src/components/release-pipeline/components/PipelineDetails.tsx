import { formatStatus, formatDuration } from '../utils/release.utils';
import { statusTone } from '../../../constants/messages';
import { PipelineDetailsProps } from '../types/pipeline-sidebar.props';

export function PipelineDetails({
  selectedPipeline,
  actionLoading,
  handleRunAction,
  hasPermission,
}: PipelineDetailsProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-neutral-900">
            {selectedPipeline.packageName}
          </h2>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone[
              formatStatus(
                selectedPipeline.currentStatus,
                selectedPipeline.currentConclusion
              )
            ] || statusTone[selectedPipeline.currentStatus]
              }`}
          >
            {formatStatus(
              selectedPipeline.currentStatus,
              selectedPipeline.currentConclusion
            )}
          </span>
        </div>
        <p className="mt-2 text-sm text-neutral-600">
          Workflow {selectedPipeline.workflowName} on{' '}
          {selectedPipeline.owner}/{selectedPipeline.repo}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-neutral-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              Latest Run
            </p>
            <p className="mt-2 font-semibold text-neutral-900">
              {selectedPipeline.lastRun
                ? `#${selectedPipeline.lastRun.id}`
                : 'Waiting for run'}
            </p>
          </div>
          <div className="rounded-2xl bg-neutral-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              Duration
            </p>
            <p className="mt-2 font-semibold text-neutral-900">
              {formatDuration(
                selectedPipeline.lastRun?.created_at,
                selectedPipeline.lastRun?.updated_at
              )}
            </p>
          </div>
          <div className="rounded-2xl bg-neutral-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              Rate Limit
            </p>
            <p className="mt-2 font-semibold text-neutral-900">
              {selectedPipeline.rateLimit?.remaining ?? 'n/a'} remaining
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedPipeline.lastRun?.html_url && (
          <a
            href={selectedPipeline.lastRun.html_url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-primary-400 hover:text-primary-700"
          >
            Open in GitHub
          </a>
        )}
        {hasPermission('maintain') && (
          <>
            <button
              type="button"
              disabled={actionLoading === 'rerun' || !selectedPipeline.lastRun}
              onClick={() => handleRunAction('rerun')}
              className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-primary-300"
            >
              {actionLoading === 'rerun' ? 'Rerunning...' : 'Rerun'}
            </button>
            <button
              type="button"
              disabled={
                actionLoading === 'cancel' ||
                selectedPipeline.currentStatus !== 'in_progress'
              }
              onClick={() => handleRunAction('cancel')}
              className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

import { formatStatus, formatRelativeTime } from '../utils/release.utils';
import { statusTone } from '../../../constants/messages';
import { PipelineSidebarProps } from '../types/pipeline-sidebar.props';

export function PipelineSidebar({ pipelines, selectedPipelineId, setSelectedPipelineId }: PipelineSidebarProps) {
  return (
    <aside className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Releases</h2>
        <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">
          live poll
        </span>
      </div>

      <div className="space-y-3">
        {pipelines.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
            No release pipelines have been tracked yet.
          </div>
        )}

        {pipelines.map(pipeline => {
          const label = formatStatus(
            pipeline.currentStatus,
            pipeline.currentConclusion
          );
          const tone =
            statusTone[label] || statusTone[pipeline.currentStatus] || statusTone.completed;

          return (
            <button
              type="button"
              key={pipeline.id}
              onClick={() => setSelectedPipelineId(pipeline.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${pipeline.id === selectedPipelineId
                ? 'border-primary-400 bg-primary-50'
                : 'border-neutral-200 bg-white hover:border-primary-200 hover:bg-neutral-50'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-neutral-900">
                    {pipeline.packageName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Release {pipeline.releaseVersion}
                  </p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
                  {label}
                </span>
              </div>
              <div className="mt-3 space-y-1 text-xs text-neutral-500">
                <p>{pipeline.owner}/{pipeline.repo}</p>
                <p>Triggered by {pipeline.triggeredBy}</p>
                <p>Updated {formatRelativeTime(pipeline.lastRun?.updated_at || pipeline.triggeredAt)}</p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

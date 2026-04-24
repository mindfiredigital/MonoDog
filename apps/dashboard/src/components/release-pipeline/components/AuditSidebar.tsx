import type { PipelineAuditLogEntry } from '../../../types/pipeline.types';
import { formatRelativeTime } from '../utils/release.utils';
import { statusTone } from "../../../constants/messages"
import { AuditSidebarProps } from '../types/pipeline-sidebar.props';

export function AuditSidebar({ auditLogs }: AuditSidebarProps) {
  return (
    <aside className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Audit Trail</h2>
        <span className="text-xs text-neutral-500">permission-aware</span>
      </div>

      <div className="space-y-3">
        {auditLogs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
            No audit events recorded for this pipeline yet.
          </div>
        )}

        {auditLogs.map(entry => (
          <div key={entry.id} className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-200">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-neutral-900">{entry.action}</span>
              <span
                className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusTone[entry.status] || statusTone.completed
                  }`}
              >
                {entry.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              {entry.username} · {entry.resourceType} · {entry.resourceName}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {formatRelativeTime(entry.timestamp)}
            </p>
            {entry.errorMessage && (
              <p className="mt-2 text-xs text-rose-600">{entry.errorMessage}</p>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

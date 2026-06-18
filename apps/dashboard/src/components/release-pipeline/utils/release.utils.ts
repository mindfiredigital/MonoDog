import type { PipelineWorkflowStepLog } from '../../../types/pipeline.types';

export function formatStatus(status: string, conclusion?: string | null) {
  if (status === 'completed' && conclusion) {
    return conclusion;
  }

  return status.replace(/_/g, ' ');
}

export function formatRelativeTime(value?: string | null) {
  if (!value) return 'n/a';

  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function formatDuration(
  startedAt?: string | null,
  completedAt?: string | null
) {
  if (!startedAt) return 'n/a';
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const start = new Date(startedAt).getTime();
  const diffSeconds = Math.max(0, Math.round((end - start) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}s`;
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export function mergeStepLogs(
  existing: PipelineWorkflowStepLog[],
  incoming: PipelineWorkflowStepLog[]
) {
  const merged = new Map<number, PipelineWorkflowStepLog>();

  existing.forEach(step => {
    merged.set(step.stepNumber, {
      ...step,
      logs: [...step.logs],
    });
  });

  incoming.forEach(step => {
    const current = merged.get(step.stepNumber);
    if (!current) {
      merged.set(step.stepNumber, step);
      return;
    }

    const seen = new Set(
      current.logs.map(log => `${log.lineNumber}-${log.timestamp}`)
    );
    const nextLogs = [...current.logs];
    step.logs.forEach(log => {
      const key = `${log.lineNumber}-${log.timestamp}`;
      if (!seen.has(key)) {
        nextLogs.push(log);
        seen.add(key);
      }
    });

    merged.set(step.stepNumber, {
      ...current,
      ...step,
      logs: nextLogs,
    });
  });

  return Array.from(merged.values()).sort(
    (a, b) => a.stepNumber - b.stepNumber
  );
}

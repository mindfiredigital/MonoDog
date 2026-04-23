export interface PipelineWorkflowRun {
  id: number;
  status: 'queued' | 'in_progress' | 'completed' | 'cancelled';
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  run_attempt: number;
  display_title?: string;
}

export interface PipelineWorkflowStepLogLine {
  lineNumber: number;
  timestamp: string;
  content: string;
  ansiContent: string;
}

export interface PipelineWorkflowStepLog {
  stepNumber: number;
  stepName: string;
  startedAt: string | null;
  completedAt: string | null;
  conclusion: string | null;
  status: 'queued' | 'in_progress' | 'completed';
  logs: PipelineWorkflowStepLogLine[];
  expanded: boolean;
}

export interface PipelineWorkflowJob {
  id: number;
  run_id: number;
  html_url: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: string | null;
  started_at: string;
  completed_at: string | null;
  name: string;
  steps: Array<{
    name: string;
    status: 'queued' | 'in_progress' | 'completed';
    conclusion: string | null;
    number: number;
    started_at: string | null;
    completed_at: string | null;
  }>;
}

export interface PipelineLogBundle {
  jobId: number;
  jobName: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: string | null;
  startedAt: string;
  completedAt: string | null;
  steps: PipelineWorkflowStepLog[];
  hasPreviousLogs: boolean;
  hasMoreLogs: boolean;
  nextCursor: number;
  totalLines: number;
}

export interface PipelineAuditLogEntry {
  id: string;
  username: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName: string;
  details: Record<string, unknown>;
  timestamp: string;
  status: 'success' | 'failure' | 'pending';
  errorMessage?: string;
}

export interface ReleasePipeline {
  id: string;
  releaseVersion: string;
  packageName: string;
  owner: string;
  repo: string;
  workflowId: string;
  workflowName: string;
  workflowPath?: string;
  triggerType: 'manual' | 'automatic';
  triggeredBy: string;
  triggeredAt: string;
  currentStatus: string;
  currentConclusion: string | null;
  lastRunId?: string;
  updatedAt?: string;
  workflowRuns: PipelineWorkflowRun[];
  lastRun: PipelineWorkflowRun | null;
  jobs: PipelineWorkflowJob[];
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
  };
}

export interface WorkflowOption {
  id: number;
  name: string;
  path: string;
  state: string;
}

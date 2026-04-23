/**
 * Pipeline Component Types
 */

export interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowRunsListProps {
  owner: string;
  repo: string;
  packageName?: string;
  onSelectRun?: (runId: number) => void;
  runId: number;
  limit?: number;
  pipelineId?: string;
}

export interface HierarchicalStep {
  id: string;
  name: string;
  status: string;
  number: number;
  conclusion: string | null;
  children?: HierarchicalStep[];
}

export interface WorkflowOption {
  value: string;
  label: string;
}

export interface WorkflowTriggerProps {
  owner: string;
  repo: string;
  defaultBranch?: string;
  onSuccess?: (runUrl: string) => void;
  onError?: (error: string) => void;
  pipelineId?: string;
}

export interface HierarchicalStep {
  stepNumber: number;
  stepName: string;
  level: number;
  startedAt: string | null;
  completedAt: string | null;
  conclusion: string | null;
  status: 'queued' | 'in_progress' | 'completed';
  logs: any[];
  children?: HierarchicalStep[];
}

export interface LogViewerProps {
  steps: HierarchicalStep[];
  jobName: string;
  jobStatus: string;
  jobConclusion: string;
  gitHubLogsUrl: string;
}

export interface StepItemProps {
  step: HierarchicalStep;
  onToggle: (stepNumber: number) => void;
  expandedSteps: Set<number>;
  stepIndex: number;
}

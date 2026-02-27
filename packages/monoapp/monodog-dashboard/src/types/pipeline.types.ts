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
  runs: WorkflowRun[];
  isLoading: boolean;
  onRunSelect: (run: WorkflowRun) => void;
}

export interface Job {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface Pipeline {
  id: number;
  name: string;
  status: string;
  runs: WorkflowRun[];
  lastRun: WorkflowRun | null;
}

export interface PipelineManagerProps {
  repositoryOwner: string;
  repositoryName: string;
  onPipelineUpdate?: (pipeline: Pipeline) => void;
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
  onTrigger: (workflowId: string) => void;
  isLoading?: boolean;
}

export interface LogLine {
  number: number;
  text: string;
}

export interface LogViewerProps {
  jobId: number;
  logs?: LogLine[];
  isLoading?: boolean;
}

export interface StepItemProps {
  step: HierarchicalStep;
  level: number;
  onSelect: (step: HierarchicalStep) => void;
}

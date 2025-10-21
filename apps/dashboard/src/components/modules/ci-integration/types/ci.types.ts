// Shared types for CI integration module components

export interface Build {
  id: string;
  packageName: string;
  branch: string;
  commit: string;
  status: 'running' | 'success' | 'failed' | 'cancelled' | 'pending';
  startTime: string;
  endTime?: string;
  duration?: number;
  stages: BuildStage[];
  triggeredBy: string;
  artifacts: string[];
}

export interface BuildStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: number;
  logs: string[];
}

export interface Pipeline {
  id: string;
  name: string;
  packageName: string;
  status: 'active' | 'paused' | 'failed';
  lastRun: string;
  nextRun?: string;
  successRate: number;
  avgDuration: number;
  triggers: string[];
}

export interface BuildStats {
  total: number;
  successful: number;
  failed: number;
  running: number;
  successRate: number;
  avgDuration: number;
}

export interface CIFilters {
  package: string;
  status: string;
  pipeline: string;
  dateRange: string;
}

export interface CIIntegrationProps {
  onBuildTrigger?: (packageName: string) => void;
  onPipelineCreate?: () => void;
  onBuildCancel?: (buildId: string) => void;
}

export interface BuildOverviewProps {
  stats: BuildStats;
  onRefresh: () => void;
  loading?: boolean;
}

export interface BuildListProps {
  builds: Build[];
  selectedBuild: string | null;
  onBuildSelect: (buildId: string | null) => void;
  filters: CIFilters;
  onFiltersChange: (filters: CIFilters) => void;
}

export interface PipelineStatusProps {
  pipelines: Pipeline[];
  onPipelineSelect: (pipelineId: string) => void;
  onPipelineToggle: (pipelineId: string, active: boolean) => void;
}

export interface BuildDetailsProps {
  build: Build | null;
  onClose: () => void;
  onCancel?: (buildId: string) => void;
  onRetry?: (buildId: string) => void;
}

export interface StageViewerProps {
  stages: BuildStage[];
  selectedStage: string | null;
  onStageSelect: (stageName: string | null) => void;
}

export interface CIControlsProps {
  onTriggerBuild: (packageName: string) => void;
  onCreatePipeline: () => void;
  onRefresh: () => void;
  loading?: boolean;
  availablePackages: string[];
}

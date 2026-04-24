import { PipelineLogBundle, PipelineWorkflowJob } from "@/types/pipeline.types";

export interface JobLogsProps {
  selectedJob: PipelineWorkflowJob;
  selectedLogs: PipelineLogBundle | null;
  expandedSteps: Set<number>;
  setExpandedSteps: React.Dispatch<React.SetStateAction<Set<number>>>;
  fetchJobLogs: (reset?: boolean) => void;
  logsLoading: boolean;
}

export interface JobListProps {
  jobs: PipelineWorkflowJob[];
  selectedJobId: number | null;
  setSelectedJobId: (id: number) => void;
}
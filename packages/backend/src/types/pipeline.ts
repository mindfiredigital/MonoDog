export type PipelineRecord = {
  id: string;
  owner: string;
  repo: string;
  workflowId: string;
  workflowPath?: string | null;
  currentStatus: string;
  currentConclusion: string | null;
  lastRunId?: string | null;
  triggeredAt: string;
  releaseVersion: string;
  packageName: string;
};

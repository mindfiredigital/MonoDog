import { PipelineAuditLogEntry, ReleasePipeline, WorkflowOption } from "@/types/pipeline.types";

export interface PipelineSidebarProps {
    pipelines: ReleasePipeline[];
    selectedPipelineId: string | null;
    setSelectedPipelineId: (id: string) => void;
}

export interface PipelineDetailsProps {
    selectedPipeline: ReleasePipeline;
    actionLoading: string | null;
    handleRunAction: (action: 'cancel' | 'rerun') => void;
    hasPermission: (permission: string) => boolean;
}

export interface ManualDispatchProps {
    workflows: WorkflowOption[];
    selectedWorkflowId: string;
    setSelectedWorkflowId: (id: string) => void;
    triggerRef: string;
    setTriggerRef: (ref: string) => void;
    triggerInputs: string;
    setTriggerInputs: (inputs: string) => void;
    handleTriggerWorkflow: () => void;
    actionLoading: string | null;
}

export interface AuditSidebarProps {
  auditLogs: PipelineAuditLogEntry[];
}
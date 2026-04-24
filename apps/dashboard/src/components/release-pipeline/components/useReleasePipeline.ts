import { useEffect, useMemo, useState } from 'react';
import apiClient from '../../../services/api';
import { DASHBOARD_API_ENDPOINTS, POLL_INTERVAL_MS, LOG_PAGE_SIZE } from '../../../constants/api-config';
import type {
  PipelineAuditLogEntry,
  PipelineLogBundle,
  ReleasePipeline,
  WorkflowOption,
} from '../../../types/pipeline.types';
import { formatStatus, mergeStepLogs } from '../utils/release.utils';

export function useReleasePipeline() {
  const [pipelines, setPipelines] = useState<ReleasePipeline[]>([]);
  const [auditLogs, setAuditLogs] = useState<PipelineAuditLogEntry[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowOption[]>([]);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<PipelineLogBundle | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [triggerRef, setTriggerRef] = useState('main');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  const [triggerInputs, setTriggerInputs] = useState('{\n  "source": "monodog"\n}');

  const selectedPipeline = useMemo(
    () => pipelines.find(pipeline => pipeline.id === selectedPipelineId) ?? null,
    [pipelines, selectedPipelineId]
  );

  const selectedJob = useMemo(
    () => selectedPipeline?.jobs.find(job => job.id === selectedJobId) ?? null,
    [selectedPipeline, selectedJobId]
  );

  const stats = useMemo(() => {
    return pipelines.reduce(
      (acc, pipeline) => {
        const normalized = formatStatus(
          pipeline.currentStatus,
          pipeline.currentConclusion
        );
        acc.total += 1;
        if (normalized === 'success') acc.success += 1;
        if (normalized === 'failure') acc.failed += 1;
        if (pipeline.currentStatus === 'queued') acc.queued += 1;
        if (pipeline.currentStatus === 'in_progress') acc.running += 1;
        return acc;
      },
      { total: 0, success: 0, failed: 0, queued: 0, running: 0 }
    );
  }, [pipelines]);

  const fetchPipelines = async (keepLoading = false) => {
    try {
      if (!keepLoading) {
        setLoading(true);
      }

      const response = await apiClient.get<{
        pipelines: ReleasePipeline[];
      }>(DASHBOARD_API_ENDPOINTS.PIPELINES.LIST);

      if (!response.success) {
        throw new Error(response.error.message);
      }

      const nextPipelines = response.data.pipelines || [];
      setPipelines(nextPipelines);
      setError(null);

      setSelectedPipelineId(currentId => {
        if (currentId && nextPipelines.some(pipeline => pipeline.id === currentId)) {
          return currentId;
        }

        return nextPipelines[0]?.id ?? null;
      });
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load release pipelines'
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (pipelineId: string) => {
    const response = await apiClient.get<{
      logs: PipelineAuditLogEntry[];
    }>(DASHBOARD_API_ENDPOINTS.PIPELINES.AUDIT_LOGS(pipelineId));

    if (response.success) {
      setAuditLogs(response.data.logs || []);
    }
  };

  const fetchWorkflows = async (owner: string, repo: string) => {
    const response = await apiClient.get<{
      workflows: WorkflowOption[];
    }>(DASHBOARD_API_ENDPOINTS.WORKFLOWS.AVAILABLE(owner, repo));

    if (!response.success) {
      return;
    }

    const nextWorkflows = response.data.workflows || [];
    setWorkflows(nextWorkflows);
    setSelectedWorkflowId(current => current || String(nextWorkflows[0]?.id || ''));
  };

  const fetchJobLogs = async (reset = false) => {
    if (!selectedPipeline || !selectedJob || !selectedPipeline.lastRun) {
      return;
    }

    try {
      setLogsLoading(true);
      const cursor = reset ? 0 : selectedLogs?.nextCursor || 0;
      const response = await apiClient.get<{
        logs: PipelineLogBundle;
        githubUrl: string;
      }>(
        `${DASHBOARD_API_ENDPOINTS.WORKFLOWS.LOGS(
          selectedPipeline.owner,
          selectedPipeline.repo,
          selectedJob.id
        )}?runId=${selectedPipeline.lastRun.id}&cursor=${cursor}&limit=${LOG_PAGE_SIZE}&pipelineId=${selectedPipeline.id}`
      );

      if (!response.success) {
        throw new Error(response.error.message);
      }

      const nextLogs = response.data.logs;
      setSelectedLogs(current => {
        if (!current || reset) {
          return nextLogs;
        }

        return {
          ...nextLogs,
          steps: mergeStepLogs(current.steps, nextLogs.steps),
        };
      });

      setExpandedSteps(current => {
        if (current.size > 0) {
          return current;
        }

        return new Set(nextLogs.steps.map(step => step.stepNumber));
      });
    } catch (logError) {
      setError(
        logError instanceof Error ? logError.message : 'Failed to load job logs'
      );
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (!selectedPipeline) {
      setAuditLogs([]);
      return;
    }

    fetchAuditLogs(selectedPipeline.id);
    fetchWorkflows(selectedPipeline.owner, selectedPipeline.repo);
    setTriggerRef('main');
  }, [selectedPipelineId]);

  useEffect(() => {
    if (!selectedPipeline) {
      setSelectedJobId(null);
      return;
    }

    setSelectedJobId(current => {
      if (current && selectedPipeline.jobs.some(job => job.id === current)) {
        return current;
      }

      return selectedPipeline.jobs[0]?.id ?? null;
    });
  }, [selectedPipeline]);

  useEffect(() => {
    setSelectedLogs(null);
    setExpandedSteps(new Set());

    if (selectedJobId) {
      fetchJobLogs(true);
    }
  }, [selectedJobId, selectedPipeline?.lastRun?.id]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchPipelines(true);

      if (
        selectedPipeline &&
        selectedPipeline.currentStatus === 'in_progress' &&
        selectedJob
      ) {
        fetchJobLogs(false);
      }
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [selectedPipeline, selectedJob, selectedLogs?.nextCursor]);

  const handleTriggerWorkflow = async () => {
    if (!selectedPipeline || !selectedWorkflowId) {
      return;
    }

    try {
      setActionLoading('trigger');
      let inputs = {};
      if (triggerInputs.trim()) {
        inputs = JSON.parse(triggerInputs);
      }

      const response = await apiClient.post(
        DASHBOARD_API_ENDPOINTS.WORKFLOWS.TRIGGER(
          selectedPipeline.owner,
          selectedPipeline.repo
        ),
        {
          workflow: selectedWorkflowId,
          ref: triggerRef,
          inputs,
          pipelineId: selectedPipeline.id,
        }
      );

      if (!response.success) {
        throw new Error(response.error.message);
      }

      await fetchPipelines(true);
      await fetchAuditLogs(selectedPipeline.id);
    } catch (triggerError) {
      setError(
        triggerError instanceof Error
          ? triggerError.message
          : 'Failed to trigger workflow'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunAction = async (action: 'cancel' | 'rerun') => {
    if (!selectedPipeline?.lastRun) {
      return;
    }

    try {
      setActionLoading(action);
      const endpoint =
        action === 'cancel'
          ? DASHBOARD_API_ENDPOINTS.WORKFLOWS.CANCEL(
            selectedPipeline.owner,
            selectedPipeline.repo,
            selectedPipeline.lastRun.id
          )
          : DASHBOARD_API_ENDPOINTS.WORKFLOWS.RERUN(
            selectedPipeline.owner,
            selectedPipeline.repo,
            selectedPipeline.lastRun.id
          );

      const response = await apiClient.post(endpoint, {
        pipelineId: selectedPipeline.id,
      });

      if (!response.success) {
        throw new Error(response.error.message);
      }

      await fetchPipelines(true);
      await fetchAuditLogs(selectedPipeline.id);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : `Failed to ${action} workflow run`
      );
    } finally {
      setActionLoading(null);
    }
  };

  return {
    pipelines,
    auditLogs,
    workflows,
    selectedPipelineId,
    setSelectedPipelineId,
    selectedJobId,
    setSelectedJobId,
    selectedLogs,
    expandedSteps,
    setExpandedSteps,
    loading,
    logsLoading,
    actionLoading,
    error,
    triggerRef,
    setTriggerRef,
    selectedWorkflowId,
    setSelectedWorkflowId,
    triggerInputs,
    setTriggerInputs,
    selectedPipeline,
    selectedJob,
    stats,
    fetchPipelines,
    fetchJobLogs,
    handleTriggerWorkflow,
    handleRunAction,
  };
}

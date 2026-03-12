import React, { useState, useEffect, useMemo } from 'react';
import { ExclamationCircleIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '../../icons/index';
import LogViewer from './LogViewer';
import WorkflowRunsList from './WorkflowRunsList';
import WorkflowTrigger from './WorkflowTrigger';
import JobsList from './JobsList';
import { useAuth } from '../../services/auth-context';
import { monorepoService } from '../../services/monorepoService';
import { getSessionPermission } from './utils/pipeline.utils';
import { DASHBOARD_ERROR_MESSAGES, DASHBOARD_AUTH_MESSAGES, DASHBOARD_RATE_LIMIT_MESSAGES } from '../../constants/messages';
import { DASHBOARD_API_ENDPOINTS } from '../../constants/api-config';
import { getRateLimitErrorMessage, getRateLimitWarningMessage } from '../../utils/rate-limit.utils';
import apiClient from '../../services/api';
import type { WorkflowRun, HierarchicalStep } from '../../types';

interface Job {
  id: number;
  gitHubJobId: number;
  name: string;
  status: string;
  conclusion: string | null;
  htmlUrl: string;
  startedAt: string | null;
  completedAt: string | null;
}

interface Pipeline {
  id: string;
  releaseVersion: string;
  packageName: string;
  workflowName: string;
  currentStatus: string;
  currentConclusion?: string | null;
  workflowId: string;
  workflowPath?: string;
  lastRunId: string | null;
  workflowRuns: WorkflowRun[];
}

interface PipelineManagerProps {
  packageName?: string;
  onNavigate?: (path: string) => void;
}

export function parseStepsFromLogs(rawLogs: string): HierarchicalStep[] {
  const lines = rawLogs.split('\n');
  const steps: HierarchicalStep[] = [];
  let currentStep: HierarchicalStep | null = null;
  const stepStack: HierarchicalStep[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Detect level from indentation
    const leadingSpaces = line.match(/^(\s*)/)?.[1].length || 0;
    const level = Math.floor(leadingSpaces / 2); // Every 2 spaces = 1 level

    // GitHub Actions group markers: ##[group]Step Name / ##[endgroup]
    if (line.includes('##[group]')) {
      // Extract new step name
      const groupMatch = line.match(/##\[group\](.*?)(?:##\[endgroup\]|$)/);
      const stepName = groupMatch ? groupMatch[1].trim() : `Step ${steps.length + 1}`;

      const newStep: HierarchicalStep = {
        name: stepName,
        logs: [],
        level: level,
        children: [],
        startIndex: i,
      };

      // Find correct parent based on level
      while (stepStack.length > 0 && stepStack[stepStack.length - 1].level >= newStep.level) {
        stepStack.pop();
      }

      // Add to parent or root
      if (stepStack.length > 0) {
        const parent = stepStack[stepStack.length - 1];
        if (!parent.children) parent.children = [];
        parent.children.push(newStep);
      } else {
        steps.push(newStep);
      }

      stepStack.push(newStep);
      currentStep = newStep;
    } else if (line.includes('##[endgroup]')) {
      // End of group - don't add this line to logs
      continue;
    } else if (trimmedLine) {
      // Regular log line (non-empty)
      if (currentStep) {
        currentStep.logs.push(line);
      }
    }
  }

  return steps;
}

export function getStatusIcon(status: string, conclusion: string | null, isUpdating: boolean = false) {
  if (isUpdating) {
    return <ClockIcon className="h-6 w-6 text-yellow-500 animate-spin" />;
  }
  if (status === 'completed') {
    if (conclusion === 'success') {
      return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
    } else if (conclusion === 'failure') {
      return <ExclamationCircleIcon className="h-6 w-6 text-red-600" />;
    } else if (conclusion === 'cancelled') {
      return <XCircleIcon className="h-6 w-6 text-gray-600" />;
    } else if (conclusion === 'skipped') {
      return <ClockIcon className="h-6 w-6 text-gray-600" />;
    }
  }
  if (status === 'in_progress' || status === 'queued') {
    return <ClockIcon className="h-6 w-6 text-blue-600" />;
  }
  return <ClockIcon className="h-6 w-6 text-gray-600" />;
}

export default function PipelineManager({
  packageName,
  onNavigate,
}: PipelineManagerProps) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [selectedRun, setSelectedRun] = useState<number | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobLogs, setJobLogs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPipelines, setUpdatingPipelines] = useState<Set<string>>(new Set());
  const { hasPermission } = useAuth();

  // Infinite scroll state
  const [pipelineOffset, setPipelineOffset] = useState(0);
  const [pipelineLoadingMore, setPipelineLoadingMore] = useState(false);
  const pipelinePageSize = 10;
  const runsPageSize = 20;

  const { owner, repo } = useMemo(() => getSessionPermission() || {}, []);

  // Fetch all pipelines on initial load (only once)
  useEffect(() => {
    const fetchPipelinesOnce = async () => {
      try {
        const url = DASHBOARD_API_ENDPOINTS.PIPELINES.LIST;

        const response = await apiClient.get(url);

        if (!response.success) {
          if (response.error?.status === 401 || response.error?.status === 403) {
            window.location.href = '/login';
            return;
          }
          // If endpoint doesn't exist (404), use empty array instead of throwing
          if (response.error?.status === 404) {
            console.warn('Pipelines endpoint not available');
            setPipelines([]);
            setLoading(false);
            return;
          }
          throw new Error(`Failed to fetch pipelines: ${response.error?.message}`);
        }

        const pipelineData = Array.isArray(response.data) ? response.data : [];
        setPipelines(pipelineData);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchPipelinesOnce();
        const interval = setInterval(fetchPipelinesOnce, 5000);

    return () => clearInterval(interval);
  }, [owner, repo, packageName]);

  // Poll all non success pipeline for status updates
  useEffect(() => {

    const pollPipelineStatus = async () => {
      try {
        // Fetch the most recent workflow run for the selected pipeline
        pipelines.forEach(async (pipeline)=>{

        if (pipeline.workflowId && pipeline.currentStatus !== 'completed' && !updatingPipelines.has(pipeline.workflowId)) {

          const runsUrl = DASHBOARD_API_ENDPOINTS.WORKFLOWS.LIST(owner, repo) + `?workflow_id=${pipeline.workflowId}&per_page=${runsPageSize}&page=1`;
          const runsResponse = await apiClient.get(runsUrl);

          if (runsResponse.success) {
            const runsData = runsResponse.data;
            const latestRun = runsData.workflow_runs?.[0] || runsData.runs?.[0];

            if (latestRun) {
              // Check if status or conclusion has changed
              const statusChanged = latestRun.status !== pipeline.currentStatus;
              const conclusionChanged = latestRun.conclusion !== pipeline.currentConclusion;

              if (statusChanged || conclusionChanged) {
                // Mark as updating
                setUpdatingPipelines(prev => new Set(prev).add(pipeline.workflowId));

                try {
                  // Update pipeline status in the database
                  const updateResponse = await apiClient.put(
                    DASHBOARD_API_ENDPOINTS.PIPELINES.STATUS(pipeline.id),
                    {
                      currentStatus: latestRun.status,
                      currentConclusion: latestRun.conclusion || null,
                      lastRunId: latestRun.id,
                    }
                  );

                  // Update the selected pipeline with new status
                  const updatedPipeline = {
                    ...pipeline,
                    currentStatus: latestRun.status,
                    currentConclusion: latestRun.conclusion || null,
                    lastRunId: latestRun.id,
                  };
                console.log(updatedPipeline)
                  if(updatedPipeline.currentStatus == 'completed'){
                      const updatedPackages = await monorepoService.refreshPackages();
                  }
                      // setSelectedPipeline(updatedPipeline);

                  // Also update in the pipelines list
                  setPipelines(prevPipelines =>
                    prevPipelines.map(p =>
                      p.id === pipeline.id ? updatedPipeline : p
                    )
                  );
                } catch (updateError) {
                  console.warn('Failed to update pipeline status:', updateError);
                } finally {
                  // Remove updating flag
                  setUpdatingPipelines(prev => {
                    const updated = new Set(prev);
                    updated.delete(pipeline.workflowId);
                    return updated;
                  });
                }
              }
            }
          }
        }

        })

      } catch (err) {
        console.warn('Failed to poll pipeline status:', err);
      }
    };

    // Poll immediately, then every 10 seconds
    pollPipelineStatus();
    const interval = setInterval(pollPipelineStatus, 10000);

    return () => clearInterval(interval);
  }, [pipelines, owner, repo]);

  // Fetch jobs for selected run
  useEffect(() => {
    if (!selectedRun) return;

    const fetchJobs = async () => {
      try {
        const response = await apiClient.get(
          DASHBOARD_API_ENDPOINTS.WORKFLOWS.RUNS(owner, repo, selectedRun)
        );

        if (!response.success) {
          if (response.error?.status === 401 || response.error?.status === 403) {
            window.location.href = '/login';
            return;
          }
          throw new Error(`Failed to fetch jobs: ${response.error?.message}`);
        }

        setJobs(response.data.jobs || []);

        // Auto-select first job
        // if (data.jobs && data.jobs.length > 0 && !selectedJob) {
        //   setSelectedJob(data.jobs[0]);
        // }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    const interval = setInterval(fetchJobs, 5000);
    fetchJobs();

    return () => clearInterval(interval);
  }, [selectedRun, owner, repo]);

  // Fetch logs for selected job
  useEffect(() => {
    if (!selectedJob) return;

    const fetchLogs = async () => {
      try {
        const response = await apiClient.get(
          DASHBOARD_API_ENDPOINTS.WORKFLOWS.LOGS(owner, repo, selectedJob.gitHubJobId)
        );

        if (!response.success) {
          // Check for rate limit error first
          const rateLimitError = getRateLimitErrorMessage(response.rateLimit);
          if (rateLimitError) {
            setError(rateLimitError);
            return;
          }

          if (response.error?.status === 403) {
            setError(DASHBOARD_ERROR_MESSAGES.PERMISSION_ERROR);
          } else if (response.error?.status === 401) {
            setError(DASHBOARD_AUTH_MESSAGES.SESSION_EXPIRED);
            window.location.href = '/login';
          } else {
            console.log(response)
            const errorDetails = response.error?.details || 'Unknown error';
            setError(`${DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_LOGS}: ${errorDetails}`);
          }
          return;
        }

        const data = response.data;

        // Check if logs are empty
        if (data.meta && data.meta.isEmpty) {
          setJobLogs('');
          setError(DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_LOGS);
        } else {
          setJobLogs(data.logs || data);

          // Warn if approaching rate limit
          const rateLimitWarning = getRateLimitWarningMessage(response.rateLimit);
          if (rateLimitWarning) {
            console.warn(rateLimitWarning);
          }
          setError(null);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_LOGS;
        setError(`${DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_LOGS}: ${errorMsg}`);
      }
    };

    // Fetch logs on selection
    fetchLogs();

    // Poll for updated logs if job is still running
    if (selectedJob.status !== 'completed') {
      const interval = setInterval(fetchLogs, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedJob, owner, repo]);

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setJobLogs(null);
  };

  // Handle infinite scroll for pipelines list
  const handlePipelinesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;

    if (isNearBottom && !pipelineLoadingMore && pipelines.length >= pipelinePageSize) {
      loadMorePipelines();
    }
  };

  const loadMorePipelines = async () => {
    if (pipelineLoadingMore) return;

    setPipelineLoadingMore(true);
    try {
      const url = DASHBOARD_API_ENDPOINTS.PIPELINES.LIST + `?offset=${pipelineOffset + pipelinePageSize}&limit=${pipelinePageSize}`;

      const response = await apiClient.get(url);
      if (!response.success) throw new Error('Failed to fetch more pipelines');

      const newPipelines = response.data;
      setPipelines(prev => [...prev, ...newPipelines]);
      setPipelineOffset(prev => prev + pipelinePageSize);
    } catch (err) {
      console.error('Error loading more pipelines:', err);
    } finally {
      setPipelineLoadingMore(false);
    }
  };

  const handleSelectRun = (runId: number) => {
    setSelectedRun(runId);
    setSelectedJob(null);
    setJobs([]);
  };

  if (loading && pipelines.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin">
          <ClockIcon className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[50vh] overflow-hidden">
      {/* Pipelines List */}
      <div className="lg:col-span-1 overflow-y-auto border-r border-gray-200" onScroll={handlePipelinesScroll}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Pipelines</h3>
            {hasPermission('maintain') && (
              <WorkflowTrigger
                owner={owner}
                repo={repo}
              />
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            {pipelines.length === 0 ? (
              <p className="text-sm text-gray-500">No pipelines found</p>
            ) : (
              <>
                {pipelines.map((pipeline) => (
                  <div
                    key={pipeline.id}
                    className={`w-full text-left p-3 rounded-lg border transition-colors border-gray-200 hover:bg-gray-50`}
                  >
                    <div className="flex items-start gap-2">
                      {getStatusIcon(pipeline.currentStatus, pipeline.currentConclusion || null, updatingPipelines.has(pipeline.id))}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {pipeline.packageName}
                        </p>
                        <p className="text-xs text-gray-500">
                          v{pipeline.releaseVersion}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {pipeline.workflowName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {pipelineLoadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Workflow Runs List */}
      <div className="lg:col-span-1 overflow-y-auto border-r border-gray-200">
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Runs</h3>
            <WorkflowRunsList
              owner={owner}
              repo={repo}
              packageName={packageName}
              onSelectRun={handleSelectRun}
              runId={selectedRun}
              limit={runsPageSize}
            />
        </div>
      </div>

      {/* Jobs List */}
      <div className="lg:col-span-1 overflow-y-auto border-r border-gray-200">
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Jobs</h3>
        <div className="space-y-2">
          {jobs.length ? (
            <JobsList
              jobs={jobs}
              selectedJob={selectedJob}
              onSelectJob={handleSelectJob}
            />
          ) : selectedRun ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-sm">Select a run to view jobs</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
      {/* Log Viewer */}
      <div className="lg:col-span-1 overflow-hidden  border-t pt-2 h-[50vh]">
        <div className="p-4 h-full overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900">Logs</h3>
          {selectedJob && jobLogs ? (
            <LogViewer
              steps={(() => {
                const hierarchicalSteps = parseStepsFromLogs(jobLogs);

                let stepCounter = 0;
                const addStepNumbers = (steps: HierarchicalStep[]): any[] => {
                  return steps.map((step) => {
                    stepCounter++;
                     const startedAt = step.logs.at(0)?.split(" ")[0];
                     const completedAt = step.logs.at(-1)?.split(" ")[0];
                    return {
                      stepNumber: stepCounter,
                      stepName: step.name,
                      level: step.level,
                      status: '',
                      conclusion: '',
                      startedAt: startedAt,
                      completedAt: completedAt,
                      logs: step.logs.map((line: string, lineIdx: number) => ({
                        lineNumber: lineIdx + 1,
                        timestamp: new Date().toISOString(),
                        content: line,
                        ansiContent: line,
                      })),
                      children: step.children ? addStepNumbers(step.children) : undefined,
                    };
                  });
                };
                return addStepNumbers(hierarchicalSteps);
              })()}
              jobName={selectedJob.name}
              jobStatus={selectedJob.status}
              jobConclusion={selectedJob.conclusion}
              gitHubLogsUrl={selectedJob.htmlUrl}
            />
          ) : selectedJob ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p className="text-sm">Select a job to view logs</p>
            </div>
          )}
        </div>
      </div>
      </div>
  );
}

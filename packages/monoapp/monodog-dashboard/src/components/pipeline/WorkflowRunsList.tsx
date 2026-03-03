import React, { useState, useEffect } from 'react';
import { ExclamationCircleIcon, CheckCircleIcon, ClockIcon } from '../../icons/index';
import { useAuth } from '../../services/auth-context';
import { DASHBOARD_ERROR_MESSAGES } from '../../constants/messages';
import { DASHBOARD_API_ENDPOINTS } from '../../constants/api-config';
import { getRateLimitErrorMessage } from '../../utils/rate-limit.utils';
import apiClient from '../../services/api';
import type { WorkflowRun, WorkflowRunsListProps } from '../../types';

function getStatusIcon(status: string, conclusion: string | null) {
  if (status === 'completed') {
    if (conclusion === 'success') {
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    } else if (conclusion === 'failure') {
      return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />;
    }
  }
  return <ClockIcon className="h-5 w-5 text-yellow-600" />;
}

function getStatusBadgeClass(status: string, conclusion: string | null): string {
  if (status === 'completed') {
    if (conclusion === 'success') {
      return 'bg-green-100 text-green-800';
    } else if (conclusion === 'failure') {
      return 'bg-red-100 text-red-800';
    }
  }
  return 'bg-yellow-100 text-yellow-800';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}

export default function WorkflowRunsList({
  owner,
  repo,
  packageName,
  onSelectRun,
  runId,
  limit = 10,
}: WorkflowRunsListProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const { isAuthenticated, hasPermission } = useAuth();

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        setLoading(true);
        setError(null);

        let url = DASHBOARD_API_ENDPOINTS.WORKFLOWS.LIST(owner, repo) + `?per_page=${limit}`;
        if (packageName) {
          url = DASHBOARD_API_ENDPOINTS.WORKFLOWS.BY_PACKAGE(owner, repo, packageName);
        }

        const response = await apiClient.get(url);
        if (!response.success) {
          // Check for rate limit error first
          const rateLimitError = getRateLimitErrorMessage(response.rateLimit);
          if (rateLimitError) {
            setError(rateLimitError);
            return;
          }
          throw new Error(DASHBOARD_ERROR_MESSAGES.FAILED_TO_FETCH_WORKFLOWS);
        }
        const data = (response.data as { runs: WorkflowRun[] });
        let runsList: WorkflowRun[] = [];


        if (packageName) {
          // When querying by package, API might return array or single object
          if (Array.isArray(data)) {
            runsList = (data as Array<{ runs: WorkflowRun[] }>)
              .flatMap((p) => p.runs || [])
              .slice(0, limit);
          } else {
            const dataObj = data as { runs: WorkflowRun[] };
            runsList = (Array.isArray(dataObj.runs) ? dataObj.runs : [])
              .slice(0, limit);
          }
        } else {
          // Direct workflow list
          runsList = Array.isArray(data.runs) ? (data.runs as WorkflowRun[]) : [];
        }

        setRuns(runsList);
      } catch (err) {
        setError(err instanceof Error ? err.message : DASHBOARD_ERROR_MESSAGES.UNKNOWN_ERROR);
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(fetchRuns, 5000); // Poll every 5 seconds
    fetchRuns();

    return () => clearInterval(interval);
  }, [owner, repo, packageName, limit]);

  const handleCancelRun = async (e: React.MouseEvent, run: WorkflowRun) => {
    e.stopPropagation();
    setActionInProgress(run.id);

    try {

      const response = await apiClient.post(
        DASHBOARD_API_ENDPOINTS.WORKFLOWS.CANCEL(owner, repo, run.id),
      );

      if (response.success) {
        // Update the run status locally
        setRuns(runs.map(r =>
          r.id === run.id
            ? { ...r, status: 'completed', conclusion: 'cancelled' }
            : r
        ));
      } else {
        // Check for rate limit error first
        const rateLimitError = getRateLimitErrorMessage(response.rateLimit);
        if (rateLimitError) {
          setError(rateLimitError);
          return;
        }
        throw new Error(DASHBOARD_ERROR_MESSAGES.FAILED_TO_CANCEL_RUN);
      }
    } catch (err) {
      console.error('Failed to cancel run:', err);
      setError(err instanceof Error ? err.message : DASHBOARD_ERROR_MESSAGES.FAILED_TO_CANCEL_RUN);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRerunRun = async (e: React.MouseEvent, run: WorkflowRun) => {
    e.stopPropagation();
    setActionInProgress(run.id);

    try {

      const response = await apiClient.post(
        DASHBOARD_API_ENDPOINTS.WORKFLOWS.RERUN(owner, repo, run.id),
        { failedOnly: false },
      );

      if (response.success) {
        // Update the run status locally
        setRuns(runs.map(r =>
          r.id === run.id
            ? { ...r, status: 'in_progress', conclusion: null }
            : r
        ));
      } else {
        // Check for rate limit error first
        const rateLimitError = getRateLimitErrorMessage(response.rateLimit);
        if (rateLimitError) {
          setError(rateLimitError);
          return;
        }
        throw new Error(DASHBOARD_ERROR_MESSAGES.FAILED_TO_RERUN_WORKFLOW);
      }
    } catch (err) {
      console.error('Failed to rerun workflow:', err);
      setError(err instanceof Error ? err.message : DASHBOARD_ERROR_MESSAGES.FAILED_TO_RERUN_WORKFLOW);
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading && runs.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin">
          <ClockIcon className="h-8 w-8 text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 border border-red-200">
        <p className="text-sm text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!runs || runs.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No workflow runs found</p>
      ) : (
        runs.map(run => (
          <div
            key={run.id}
            className={`text-left p-3 rounded-lg border transition-colors ${
              runId === run.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <button
              onClick={() => onSelectRun?.(run.id)}
              className="w-full text-left"
            >
              <div className="flex items-start gap-2">
                {getStatusIcon(run.status, run.conclusion)}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-gray-900">
                    {run.name}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(
                        run.status,
                        run.conclusion
                      )}`}
                    >
                      {run.conclusion ?? run.status}
                    </span>
                    <span> • </span>
                    <span>Branch: {run.head_branch}</span>
                    <span> • </span>
                    <span>by {run.actor.login}</span>
                    <span> • </span>
                    <span>{formatDate(run.created_at)}</span>
                  </p>
                </div>
              </div>
            </button>

            {hasPermission('maintain') && (
              <div className="flex gap-2 mt-3">
                {run.status === 'in_progress' && (
                  <button
                    onClick={e => handleCancelRun(e, run)}
                    disabled={actionInProgress === run.id}
                    className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Cancel this workflow run"
                  >
                    {actionInProgress === run.id
                      ? 'Cancelling...'
                      : 'Cancel Run'}
                  </button>
                )}
                {(run.conclusion === 'cancelled' ||
                  run.conclusion === 'failure') && (
                  <button
                    onClick={e => handleRerunRun(e, run)}
                    disabled={actionInProgress === run.id}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Rerun this workflow"
                  >
                    {actionInProgress === run.id ? 'Rerunning...' : 'Rerun'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

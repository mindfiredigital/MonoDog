/**
 * GitHub Actions and Release Pipeline Types
 * Types for workflow management and release tracking
 */

/**
 * GitHub workflow run status
 */
export type WorkflowRunStatus =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'action_required'
  | 'stale';

/**
 * GitHub workflow run conclusion
 */
export type WorkflowRunConclusion =
  | 'success'
  | 'failure'
  | 'neutral'
  | 'cancelled'
  | 'skipped'
  | 'timed_out'
  | 'action_required'
  | null;

/**
 * GitHub workflow run
 */
export interface WorkflowRun {
  id: number;
  node_id: string;
  name: string;
  head_branch: string;
  head_sha: string;
  path: string;
  display_title: string;
  run_number: number;
  event: string;
  status: WorkflowRunStatus;
  conclusion: WorkflowRunConclusion;
  workflow_id: number;
  check_suite_id: number;
  check_suite_node_id: string;
  url: string;
  html_url: string;
  pull_requests: unknown[];
  created_at: string;
  updated_at: string;
  actor: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  run_attempt: number;
  referenced_workflows?: unknown[];
  triggering_actor: {
    login: string;
    id: number;
  };
  run_started_at: string;
  jobs_url: string;
  logs_url: string;
  check_runs_url: string;
  artifacts_url: string;
  cancel_url: string;
  rerun_url: string;
  previous_attempt_url: string | null;
  workflow_url: string;
  head_commit: {
    id: string;
    tree_id: string;
    message: string;
    timestamp: string;
    author: {
      name: string;
      email: string;
    };
    committer: {
      name: string;
      email: string;
    };
  };
  repository: {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
      login: string;
      id: number;
    };
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    forks_url: string;
    keys_url: string;
    collaborators_url: string;
    teams_url: string;
    hooks_url: string;
    issue_events_url: string;
    events_url: string;
    assignees_url: string;
    branches_url: string;
    tags_url: string;
    blobs_url: string;
    git_tags_url: string;
    git_refs_url: string;
    trees_url: string;
    statuses_url: string;
    languages_url: string;
    stargazers_url: string;
    contributors_url: string;
    subscribers_url: string;
    subscription_url: string;
    commits_url: string;
    git_commits_url: string;
    comments_url: string;
    issue_comment_url: string;
    contents_url: string;
    compare_url: string;
    merges_url: string;
    archive_url: string;
    downloads_url: string;
    issues_url: string;
    pulls_url: string;
    milestones_url: string;
    notifications_url: string;
    labels_url: string;
    releases_url: string;
    deployments_url: string;
  };
  head_repository: {
    id: number;
    node_id: string;
    name: string;
    full_name: string;
    private: boolean;
    owner: {
      login: string;
      id: number;
    };
    html_url: string;
    description: string | null;
    fork: boolean;
    url: string;
    created_at: string;
    updated_at: string;
    pushed_at: string;
    git_url: string;
    ssh_url: string;
    clone_url: string;
    svn_url: string;
    homepage: string | null;
    size: number;
    stargazers_count: number;
    watchers_count: number;
    language: string | null;
    has_issues: boolean;
    has_projects: boolean;
    has_downloads: boolean;
    has_wiki: boolean;
    has_pages: boolean;
    forks_count: number;
    mirror_url: string | null;
    archived: boolean;
    disabled: boolean;
    open_issues_count: number;
    license: {
      key: string;
      name: string;
      url: string;
      spdx_id: string;
      node_id: string;
    } | null;
    allow_forking: boolean;
    is_template: boolean;
    web_commit_signoff_required: boolean;
    topics: string[];
    visibility: string;
    default_branch: string;
  };
}

/**
 * GitHub workflow job
 */
export interface WorkflowJob {
  id: number;
  run_id: number;
  run_url: string;
  node_id: string;
  head_sha: string;
  url: string;
  html_url: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: WorkflowRunConclusion;
  started_at: string;
  completed_at: string | null;
  name: string;
  steps: WorkflowStep[];
  check_run_url: string;
  labels: string[];
  runner_id: number | null;
  runner_name: string | null;
  runner_group_id: number | null;
  runner_group_name: string | null;
}

/**
 * GitHub workflow step
 */
export interface WorkflowStep {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: WorkflowRunConclusion;
  number: number;
  started_at: string | null;
  completed_at: string | null;
}

/**
 * Log line entry with ANSI support
 */
export interface LogLine {
  lineNumber: number;
  timestamp: string;
  content: string;
  ansiContent: string; // Raw content with ANSI codes preserved
}

/**
 * Log entry for a workflow step
 */
export interface StepLog {
  stepNumber: number;
  stepName: string;
  startedAt: string | null;
  completedAt: string | null;
  conclusion: WorkflowRunConclusion;
  status: 'queued' | 'in_progress' | 'completed';
  logs: LogLine[];
  expanded: boolean;
}

/**
 * Full job logs with step hierarchy
 */
export interface JobLogs {
  jobId: number;
  jobName: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: WorkflowRunConclusion;
  startedAt: string;
  completedAt: string | null;
  steps: StepLog[];
  hasPreviousLogs: boolean; // For pagination
  hasMoreLogs: boolean; // For pagination
}

/**
 * Release pipeline with associated workflow runs
 */
export interface ReleasePipeline {
  id: string;
  releaseVersion: string;
  packageName: string;
  owner: string;
  repo: string;
  workflowId: string;
  workflowName: string;
  workflowPath?: string; // Path to the workflow file (e.g., .github/workflows/release.yml)
  triggerType: 'manual' | 'automatic'; // push, pull_request, etc.
  triggeredBy: string;
  triggeredAt: string;
  workflowRuns: WorkflowRun[];
  currentStatus: WorkflowRunStatus;
  currentConclusion: WorkflowRunConclusion;
  lastRunId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Workflow trigger request
 */
export interface WorkflowTriggerRequest {
  owner: string;
  repo: string;
  workflow: string | number; // workflow ID or filename
  ref: string; // branch name or tag
  inputs?: Record<string, string>; // Optional inputs for workflow
}

/**
 * Workflow trigger response
 */
export interface WorkflowTriggerResponse {
  success: boolean;
  runId?: number;
  runUrl?: string;
  message: string;
}

/**
 * Audit log entry for pipeline actions
 */
export interface PipelineAuditLog {
  id: string;
  userId: number;
  username: string;
  action: 'trigger' | 'cancel' | 'rerun' | 'view_logs' | 'approve_deployment';
  resourceType: 'workflow_run' | 'job' | 'pipeline';
  resourceId: string;
  resourceName: string;
  details: Record<string, unknown>;
  timestamp: string;
  status: 'success' | 'failure' | 'pending';
  errorMessage?: string;
}

/**
 * GitHub Actions API rate limit info
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  used: number;
}

/**
 * Polling state for real-time updates
 */
export interface PollingState {
  isActive: boolean;
  interval: number; // milliseconds
  lastUpdate: number; // Unix timestamp
  nextUpdate: number; // Unix timestamp
  errors: number; // error count since last success
  maxErrors: number;
}

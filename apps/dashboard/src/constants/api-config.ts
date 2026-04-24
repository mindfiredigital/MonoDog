/**
 * API Configuration for Dashboard
 * Base URLs, endpoints, and API configuration constants
 */

// API BASE CONFIGURATION

const DEFAULT_API_HOST = 'localhost';
const DEFAULT_API_PORT = 4000;
export const DEFAULT_TIMEOUT = 30000;

export const TIMEOUT_MS = 60000;


// API ENDPOINTS

export const DASHBOARD_API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    CALLBACK: '/auth/callback',
    ME: '/auth/me',
    VALIDATE: '/auth/validate',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // Packages endpoints
  PACKAGES: {
    REFRESH: '/packages/refresh',
    UPDATE_CONFIG: '/packages/update-config',
    LIST: '/packages',
    DETAILS: (packageName: string) =>
      `/packages/${encodeURIComponent(packageName)}`,
  },

  // Pipeline endpoints
  PIPELINES: {
    LIST: '/pipelines',
    DETAILS: (pipelineId: string) => `/pipelines/${pipelineId}`,
    STATUS: (pipelineId: string) => `/pipelines/${pipelineId}/status`,
    AUDIT_LOGS: (pipelineId: string) => `/pipelines/${pipelineId}/audit-logs`,
    RUN_STATUS: (pipelineId: string) => `/pipelines/${pipelineId}/run-status`,
  },

  // Publish endpoints
  PUBLISH: {
    PREVIEW: '/publish/preview',
    STATUS: '/publish/status',
    PACKAGES: '/publish/packages',
    CHANGESETS: '/publish/changesets',
    CREATE_CHANGESET: '/publish/changesets/create',
    TRIGGER: '/publish/trigger',
  },

  // Configuration endpoints
  CONFIG: {
    FILES: '/config/files',
    FILE: (fileId: string) => {
      return `/config/files/${encodeURIComponent(fileId)}`;
    },
  },

  // Health endpoints
  HEALTH: {
    PACKAGES: '/health/packages',
    REFRESH: '/health/refresh',
  },

  // Workflow endpoints (GitHub Actions management)
  WORKFLOWS: {
    LIST: (owner: string, repo: string) => `/workflows/${owner}/${repo}`,
    AVAILABLE: (owner: string, repo: string) =>
      `/workflows/${owner}/${repo}/available`,
    BY_PACKAGE: (owner: string, repo: string, packageName: string) =>
      `/workflows/package/${owner}/${repo}/${encodeURIComponent(packageName)}`,
    RUNS: (owner: string, repo: string, runId: number) =>
      `/workflows/${owner}/${repo}/runs/${runId}`,
    LOGS: (owner: string, repo: string, jobId: number) =>
      `/workflows/${owner}/${repo}/jobs/${jobId}/logs`,
    TRIGGER: (owner: string, repo: string) =>
      `/workflows/${owner}/${repo}/trigger`,
    CANCEL: (owner: string, repo: string, runId: number) =>
      `/workflows/${owner}/${repo}/runs/${runId}/cancel`,
    RERUN: (owner: string, repo: string, runId: number) =>
      `/workflows/${owner}/${repo}/runs/${runId}/rerun`,
  },
} as const;


export const POLL_INTERVAL_MS = 5000;
export const LOG_PAGE_SIZE = 800;
/**
 * Swagger API Paths
 * Main file that combines all API endpoint definitions by groups
 *
 * Organized by functional groups:
 * - Authentication endpoints (/auth/*)
 * - Packages, Health, Commits & Configuration endpoints (/packages/*, /health/*, /commits/*, /config/*)
 * - Publishing endpoints (/publish/*)
 * - Pipelines endpoints (/pipelines/*)
 * - Workflows endpoints (/workflows/*)
 */

import { authPaths } from './swagger-paths-auth';
import { packagesPaths, healthPaths, commitsPaths, configPaths } from './swagger-paths-packages';
import { publishPaths } from './swagger-paths-publish';
import { pipelinesPaths } from './swagger-paths-pipelines';
import { workflowsPaths } from './swagger-paths-workflows';

export const swaggerPaths = {
  ...authPaths,
  ...packagesPaths,
  ...healthPaths,
  ...commitsPaths,
  ...configPaths,
  ...publishPaths,
  ...pipelinesPaths,
  ...workflowsPaths,
};

// API tags for grouping endpoints in documentation
export const swaggerTags = [
  {
    name: 'Authentication',
    description: 'GitHub OAuth authentication and session management endpoints',
  },
  {
    name: 'Packages',
    description: 'Package management and analysis endpoints',
  },
  {
    name: 'Health',
    description: 'Health monitoring and status endpoints',
  },
  {
    name: 'Commits',
    description: 'Git commit history and analysis endpoints',
  },
  {
    name: 'Configuration',
    description: 'Configuration file management endpoints',
  },
  {
    name: 'Publish',
    description: 'Generate Changeset and publish packages endpoints',
  },
  {
    name: 'Pipelines',
    description: 'GitHub Actions pipeline management and monitoring endpoints',
  },
  {
    name: 'Workflows',
    description: 'GitHub Actions workflow runs and job management endpoints',
  },
];

// Re-export individual path groups for granular imports if needed
export {
  authPaths,
  packagesPaths,
  healthPaths,
  commitsPaths,
  configPaths,
  publishPaths,
  pipelinesPaths,
  workflowsPaths,
};

/**
 * Swagger Workflows Paths
 * GitHub Actions workflow runs and job management endpoints
 */

export const workflowsPaths = {
  '/workflows/{owner}/{repo}/available': {
    get: {
      tags: ['Workflows'],
      summary: 'List available workflows',
      operationId: 'listAvailableWorkflows',
      description:
        'Lists all available GitHub Actions workflows in a repository',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'owner',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository owner',
        },
        {
          name: 'repo',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository name',
        },
      ],
      responses: {
        '200': {
          description: 'List of available workflows',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Workflow' },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '404': { description: 'Repository not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/workflows/{owner}/{repo}': {
    get: {
      tags: ['Workflows'],
      summary: 'Get workflow runs',
      operationId: 'getWorkflowRuns',
      description: 'Retrieves all workflow runs for a repository',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'owner',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository owner',
        },
        {
          name: 'repo',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository name',
        },
      ],
      responses: {
        '200': {
          description: 'List of workflow runs',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/WorkflowRun' },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '404': { description: 'Repository not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/workflows/{owner}/{repo}/runs/{runId}': {
    get: {
      tags: ['Workflows'],
      summary: 'Get workflow run details',
      operationId: 'getWorkflowRunWithJobs',
      description:
        'Retrieves detailed information for a specific workflow run including all jobs',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'owner',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository owner',
        },
        {
          name: 'repo',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository name',
        },
        {
          name: 'runId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Workflow run ID',
        },
      ],
      responses: {
        '200': {
          description: 'Workflow run details with jobs',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WorkflowRunDetail' },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '404': { description: 'Workflow run not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/workflows/{owner}/{repo}/jobs/{jobId}/logs': {
    get: {
      tags: ['Workflows'],
      summary: 'Get job logs',
      operationId: 'getJobLogs',
      description: 'Retrieves logs for a specific job in a workflow run',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'owner',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository owner',
        },
        {
          name: 'repo',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository name',
        },
        {
          name: 'jobId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Job ID',
        },
      ],
      responses: {
        '200': {
          description: 'Job logs',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  logs: { type: 'string' },
                },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '404': { description: 'Job not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/workflows/{owner}/{repo}/trigger': {
    post: {
      tags: ['Workflows'],
      summary: 'Trigger a workflow',
      operationId: 'triggerWorkflow',
      description:
        'Triggers a GitHub Actions workflow in a repository. Requires maintain permission.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'owner',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository owner',
        },
        {
          name: 'repo',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository name',
        },
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                workflowId: {
                  type: 'string',
                  description: 'ID or name of the workflow to trigger',
                },
                ref: {
                  type: 'string',
                  description: 'Git ref (branch, tag, or SHA)',
                },
                inputs: {
                  type: 'object',
                  description: 'Workflow input parameters',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Workflow triggered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  runId: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '400': { description: 'Invalid request' },
        '401': { description: 'Unauthorized - authentication required' },
        '403': {
          description:
            'Forbidden - insufficient permissions (maintain required)',
        },
        '404': { description: 'Repository or workflow not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/workflows/{owner}/{repo}/runs/{runId}/cancel': {
    post: {
      tags: ['Workflows'],
      summary: 'Cancel a workflow run',
      operationId: 'cancelWorkflowRun',
      description:
        'Cancels an in-progress workflow run. Requires maintain permission.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'owner',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository owner',
        },
        {
          name: 'repo',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository name',
        },
        {
          name: 'runId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Workflow run ID',
        },
      ],
      responses: {
        '200': { description: 'Workflow run cancelled successfully' },
        '401': { description: 'Unauthorized - authentication required' },
        '403': {
          description:
            'Forbidden - insufficient permissions (maintain required)',
        },
        '404': { description: 'Workflow run not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/workflows/{owner}/{repo}/runs/{runId}/rerun': {
    post: {
      tags: ['Workflows'],
      summary: 'Rerun a workflow',
      operationId: 'rerunWorkflow',
      description:
        'Reruns a completed workflow run. Requires maintain permission.',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'owner',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository owner',
        },
        {
          name: 'repo',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Repository name',
        },
        {
          name: 'runId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'Workflow run ID',
        },
      ],
      responses: {
        '200': {
          description: 'Workflow rerun successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  newRunId: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '403': {
          description:
            'Forbidden - insufficient permissions (maintain required)',
        },
        '404': { description: 'Workflow run not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
};

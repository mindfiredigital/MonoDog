/**
 * Swagger Pipelines Paths
 * GitHub Actions pipeline management and monitoring endpoints
 */

export const pipelinesPaths = {
  '/pipelines': {
    get: {
      tags: ['Pipelines'],
      summary: 'Get recent pipelines',
      operationId: 'getRecentPipelines',
      description:
        'Retrieves recent GitHub Actions pipelines and workflow runs for the repository',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'List of recent pipelines',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Pipeline' },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/pipelines/scheduled': {
    get: {
      tags: ['Pipelines'],
      summary: 'Get scheduled releases',
      operationId: 'getPendingScheduledReleases',
      description: 'Retrieves all pending scheduled releases',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'List of scheduled releases',
        },
        '401': { description: 'Unauthorized' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/pipelines/schedule': {
    post: {
      tags: ['Pipelines'],
      summary: 'Schedule a new release',
      operationId: 'scheduleRelease',
      description: 'Schedules a new package release for a future date',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                packageName: { type: 'string' },
                version: { type: 'string' },
                scheduledAt: { type: 'string', format: 'date-time' },
                summary: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'Release scheduled successfully' },
        '400': { description: 'Invalid request' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden (write access required)' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/pipelines/scheduled/{id}': {
    delete: {
      tags: ['Pipelines'],
      summary: 'Cancel scheduled release',
      operationId: 'cancelScheduledRelease',
      description: 'Cancels a pending scheduled release',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Scheduled release cancelled' },
        '401': { description: 'Unauthorized' },
        '403': { description: 'Forbidden' },
        '404': { description: 'Scheduled release not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/pipelines/{pipelineId}': {
    get: {
      tags: ['Pipelines'],
      summary: 'Get pipeline details',
      operationId: 'getPipelineDetails',
      description: 'Retrieves details for a specific pipeline',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'pipelineId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Pipeline details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Pipeline' },
            },
          },
        },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Pipeline not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/pipelines/{pipelineId}/refresh': {
    post: {
      tags: ['Pipelines'],
      summary: 'Refresh pipeline from GitHub Actions run',
      operationId: 'refreshPipelineFromRun',
      description: 'Refreshes the pipeline status by fetching the latest workflow run details from GitHub',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'pipelineId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Pipeline refreshed successfully' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Pipeline not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/pipelines/{pipelineId}/run-status': {
    get: {
      tags: ['Pipelines'],
      summary: 'Get pipeline run status',
      operationId: 'getPipelineRunStatus',
      description: 'Gets the current status of the pipeline (aliases to refresh)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'pipelineId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Pipeline run status returned' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Pipeline not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/pipelines/{pipelineId}/status': {
    put: {
      tags: ['Pipelines'],
      summary: 'Update pipeline status',
      operationId: 'updatePipelineStatus',
      description:
        'Updates the status of a pipeline based on the latest workflow run',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'pipelineId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/PipelineStatus' },
          },
        },
      },
      responses: {
        '200': { description: 'Pipeline status updated successfully' },
        '400': { description: 'Invalid request' },
        '401': { description: 'Unauthorized - authentication required' },
        '404': { description: 'Pipeline not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/pipelines/{pipelineId}/audit-logs': {
    get: {
      tags: ['Pipelines'],
      summary: 'Get pipeline audit logs',
      operationId: 'getPipelineAuditLogs',
      description:
        'Retrieves audit logs for a specific pipeline including all status changes and events',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'pipelineId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Pipeline audit logs',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/AuditLog' },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '404': { description: 'Pipeline not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
};

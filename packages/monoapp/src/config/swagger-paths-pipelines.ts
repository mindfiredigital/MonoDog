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
      description: 'Retrieves recent GitHub Actions pipelines and workflow runs for the repository',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'List of recent pipelines',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: '#/components/schemas/Pipeline' } },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/pipelines/{pipelineId}/status': {
    put: {
      tags: ['Pipelines'],
      summary: 'Update pipeline status',
      operationId: 'updatePipelineStatus',
      description: 'Updates the status of a pipeline based on the latest workflow run',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'pipelineId', in: 'path', required: true, schema: { type: 'string' } }],
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
      description: 'Retrieves audit logs for a specific pipeline including all status changes and events',
      security: [{ BearerAuth: [] }],
      parameters: [{ name: 'pipelineId', in: 'path', required: true, schema: { type: 'string' } }],
      responses: {
        '200': {
          description: 'Pipeline audit logs',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: '#/components/schemas/AuditLog' } },
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

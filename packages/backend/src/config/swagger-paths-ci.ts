/**
 * Swagger CI Paths
 * Continuous Integration endpoints for monorepo and package builds
 */

export const ciPaths = {
  '/ci/status': {
    get: {
      tags: ['CI'],
      summary: 'Get monorepo CI status',
      operationId: 'getMonorepoCIStatus',
      description: 'Retrieves the overall CI build status for the monorepo',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': { description: 'CI status retrieved successfully' },
        '401': { description: 'Unauthorized' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/ci/packages/{name}': {
    get: {
      tags: ['CI'],
      summary: 'Get package CI status',
      operationId: 'getPackageCIStatus',
      description: 'Retrieves the CI build status for a specific package',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'name',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Package CI status retrieved successfully' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Package not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/ci/trigger': {
    post: {
      tags: ['CI'],
      summary: 'Trigger CI build',
      operationId: 'triggerCIBuild',
      description: 'Triggers a new CI workflow run',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                workflowId: { type: 'string' },
                ref: { type: 'string' },
                inputs: { type: 'object' },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'CI build triggered successfully' },
        '401': { description: 'Unauthorized' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/ci/builds/{buildId}/logs': {
    get: {
      tags: ['CI'],
      summary: 'Get build logs',
      operationId: 'getBuildLogs',
      description: 'Retrieves raw logs for a specific CI build',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'buildId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Build logs retrieved successfully' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Build not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/ci/builds/{buildId}/artifacts': {
    get: {
      tags: ['CI'],
      summary: 'Get build artifacts',
      operationId: 'getBuildArtifacts',
      description: 'Retrieves a list of artifacts produced by a CI build',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'buildId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Build artifacts retrieved successfully' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Build not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/ci/pipelines/{buildId}/cancel': {
    post: {
      tags: ['CI'],
      summary: 'Cancel pipeline',
      operationId: 'cancelPipeline',
      description: 'Cancels an in-progress CI pipeline build',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'buildId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Pipeline cancelled successfully' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Build not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/ci/pipelines/{buildId}/retry': {
    post: {
      tags: ['CI'],
      summary: 'Retry pipeline',
      operationId: 'retryPipeline',
      description: 'Retries a failed CI pipeline build',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'buildId',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Pipeline retried successfully' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Build not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/ci/pipelines/{pipelineId}/toggle': {
    post: {
      tags: ['CI'],
      summary: 'Toggle pipeline state',
      operationId: 'togglePipeline',
      description: 'Enables or disables a specific pipeline workflow',
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
            schema: {
              type: 'object',
              properties: {
                active: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        '200': { description: 'Pipeline toggled successfully' },
        '401': { description: 'Unauthorized' },
        '404': { description: 'Pipeline not found' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/ci/workflows/available': {
    get: {
      tags: ['CI'],
      summary: 'Get available CI workflows',
      operationId: 'getAvailableCIWorkflows',
      description:
        'Retrieves a list of available CI workflows in the repository',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': { description: 'Available workflows retrieved successfully' },
        '401': { description: 'Unauthorized' },
        '500': { description: 'Internal server error' },
      },
    },
  },
};

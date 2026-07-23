/**
 * Swagger Permissions Paths
 * Repository permission checking and cache management endpoints
 */

export const permissionsPaths = {
  '/permissions/{owner}/{repo}': {
    get: {
      tags: ['Permissions'],
      summary: 'Get repository permissions',
      operationId: 'getRepositoryPermission',
      description:
        "Retrieves the authenticated user's permission level (admin, write, read, etc.) for a specific repository",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'owner',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
        {
          name: 'repo',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Permission retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  permission: { type: 'string' },
                },
              },
            },
          },
        },
        '401': { description: 'Unauthorized' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/permissions/{owner}/{repo}/can-action': {
    post: {
      tags: ['Permissions'],
      summary: 'Check specific action permission',
      operationId: 'checkActionPermission',
      description:
        'Checks if the user has sufficient permission to perform a specific action (e.g., publish, trigger_workflow)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'owner',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
        {
          name: 'repo',
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
                action: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Permission check result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  allowed: { type: 'boolean' },
                },
              },
            },
          },
        },
        '401': { description: 'Unauthorized' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/permissions/{owner}/{repo}/invalidate': {
    post: {
      tags: ['Permissions'],
      summary: 'Invalidate permission cache',
      operationId: 'invalidateCache',
      description:
        'Forces a refresh of the cached repository permissions for the current user',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'owner',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
        {
          name: 'repo',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Cache invalidated successfully' },
        '401': { description: 'Unauthorized' },
        '500': { description: 'Internal server error' },
      },
    },
  },
};

/**
 * Swagger paths for Activity endpoint
 * Covers: GET /api/activity
 */

export const activityPaths = {
  '/api/activity': {
    get: {
      tags: ['Activity'],
      summary: 'Get recent activity',
      description:
        'Returns a list of recent activity logs across all packages in the monorepo.',
      parameters: [
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: {
            type: 'integer',
            default: 20,
            minimum: 1,
            maximum: 100,
          },
          description: 'Maximum number of activity entries to return',
        },
      ],
      responses: {
        200: {
          description: 'Activity log retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    action: { type: 'string', example: 'package_updated' },
                    packageId: { type: 'string' },
                    details: { type: 'string' },
                    createdAt: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to fetch activity',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Failed to fetch recent activity',
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

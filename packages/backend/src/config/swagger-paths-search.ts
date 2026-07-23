/**
 * Swagger paths for Search endpoint
 * Covers: GET /api/search
 */

export const searchPaths = {
  '/api/search': {
    get: {
      tags: ['Search'],
      summary: 'Search packages',
      description:
        'Search monorepo packages by name, type, or status using a text query.',
      parameters: [
        {
          name: 'q',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'Search query string to match against package names',
          example: 'utils',
        },
        {
          name: 'type',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'Filter by package type',
        },
        {
          name: 'status',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'Filter by package status',
        },
      ],
      responses: {
        200: {
          description: 'Search results returned successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', example: '@mindfiredigital/utils' },
                    version: { type: 'string', example: '1.0.2' },
                    path: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Search failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: {
                    type: 'string',
                    example: 'Failed to search packages',
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

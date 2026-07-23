/**
 * Swagger paths for System and Stats endpoints
 * Covers: GET /api/system, GET /api/stats
 */

export const systemPaths = {
  '/api/system': {
    get: {
      tags: ['System'],
      summary: 'Get system information',
      description:
        'Returns server runtime information including Node.js version, platform, memory usage, and uptime.',
      responses: {
        200: {
          description: 'System information retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nodeVersion: {
                    type: 'string',
                    example: 'v22.17.0',
                  },
                  platform: { type: 'string', example: 'linux' },
                  arch: { type: 'string', example: 'x64' },
                  memory: {
                    type: 'object',
                    properties: {
                      rss: { type: 'number' },
                      heapTotal: { type: 'number' },
                      heapUsed: { type: 'number' },
                      external: { type: 'number' },
                    },
                  },
                  uptime: {
                    type: 'number',
                    description: 'Server uptime in seconds',
                  },
                  pid: { type: 'number' },
                  cwd: { type: 'string' },
                  env: {
                    type: 'object',
                    properties: {
                      NODE_ENV: { type: 'string' },
                      PORT: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to fetch system information',
        },
      },
    },
  },
  '/api/stats': {
    get: {
      tags: ['System'],
      summary: 'Get monorepo statistics',
      description:
        'Returns aggregated statistics about the monorepo including package count, dependency counts, and scan timing.',
      responses: {
        200: {
          description: 'Statistics retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  totalPackages: { type: 'number', example: 5 },
                  totalDependencies: { type: 'number' },
                  totalDevDependencies: { type: 'number' },
                  averageScore: { type: 'number' },
                  timestamp: { type: 'number' },
                  scanDuration: { type: 'number' },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to fetch statistics',
        },
      },
    },
  },
};

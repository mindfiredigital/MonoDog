/**
 * Swagger paths for Scan endpoints
 * Covers: POST /api/scan, GET /api/scan/results, GET /api/scan/export/:format
 */

export const scanPaths = {
  '/api/scan': {
    post: {
      tags: ['Scan'],
      summary: 'Perform monorepo scan',
      description:
        'Triggers a full scan of the monorepo filesystem. Use force=true to bypass cache.',
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                force: {
                  type: 'boolean',
                  description: 'Force re-scan even if cached results exist',
                  example: false,
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Scan completed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  packages: {
                    type: 'array',
                    items: { type: 'object' },
                  },
                  stats: { type: 'object' },
                  dependencyGraph: { type: 'object' },
                },
              },
            },
          },
        },
        500: {
          description: 'Scan failed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'Failed to perform scan' },
                },
              },
            },
          },
        },
      },
    },
  },
  '/api/scan/results': {
    get: {
      tags: ['Scan'],
      summary: 'Get scan results',
      description:
        'Returns the most recent scan results. Does not trigger a new scan.',
      responses: {
        200: {
          description: 'Scan results retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  packages: {
                    type: 'array',
                    items: { type: 'object' },
                  },
                  stats: { type: 'object' },
                },
              },
            },
          },
        },
        500: {
          description: 'Failed to fetch scan results',
        },
      },
    },
  },
  '/api/scan/export/{format}': {
    get: {
      tags: ['Scan'],
      summary: 'Export scan results',
      description:
        'Exports scan results in the specified format (json, csv, or html).',
      parameters: [
        {
          name: 'format',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            enum: ['json', 'csv', 'html'],
          },
          description: 'Export format',
        },
        {
          name: 'filename',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description:
            'Custom filename for the downloaded file (e.g. "report.csv")',
        },
      ],
      responses: {
        200: {
          description: 'Export data returned in the requested format',
        },
        400: {
          description: 'Invalid export format',
        },
        500: {
          description: 'Failed to export scan results',
        },
      },
    },
  },
};

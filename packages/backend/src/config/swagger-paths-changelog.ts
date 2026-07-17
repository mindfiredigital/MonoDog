/**
 * Swagger paths for Changelog endpoint
 * Covers: GET /api/changelog/:packageName
 */

export const changelogPaths = {
  '/api/changelog/{packageName}': {
    get: {
      tags: ['Changelog'],
      summary: 'Get package changelog',
      description:
        'Returns the parsed changelog history for a specific package. Merges local CHANGELOG.md entries with GitHub Releases if owner/repo/token are provided. Requires authentication.',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'packageName',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'The name of the package',
          example: '@mindfiredigital/monodog',
        },
        {
          name: 'owner',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'GitHub repository owner (for fetching GitHub Releases)',
          example: 'mindfiredigital',
        },
        {
          name: 'repo',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'GitHub repository name',
          example: 'MonoDog',
        },
      ],
      responses: {
        200: {
          description:
            'Changelog entries sorted by date (latest first), each with associated commits',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    version: { type: 'string', example: '1.5.8' },
                    date: { type: 'string', example: '2026-07-10' },
                    body: {
                      type: 'string',
                      description: 'Markdown changelog content',
                    },
                    source: {
                      type: 'string',
                      enum: ['local', 'github'],
                    },
                    commits: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          hash: { type: 'string' },
                          message: { type: 'string' },
                          author: { type: 'string' },
                          date: {
                            type: 'string',
                            format: 'date-time',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Package name is required',
        },
        404: {
          description: 'Package not found',
        },
        500: {
          description: 'Failed to fetch changelog history',
        },
      },
    },
  },
};

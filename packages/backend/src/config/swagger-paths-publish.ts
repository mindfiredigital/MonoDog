/**
 * Swagger Publish Paths
 * Generate Changeset and publish packages endpoints
 */

export const publishPaths = {
  '/publish/packages': {
    get: {
      tags: ['Publish'],
      summary: 'Get all workspace packages for publishing',
      operationId: 'getPublishPackages',
      description:
        'Retrieves all public packages in the workspace that can be published. Private packages are filtered out.',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'List of packages available for publishing',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  packages: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/PublishPackage' },
                  },
                  total: {
                    type: 'number',
                    description: 'Total number of packages',
                  },
                },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/publish/changesets': {
    get: {
      tags: ['Publish'],
      summary: 'Get existing unpublished changesets',
      operationId: 'getPublishChangesets',
      description:
        'Retrieves all existing changesets that have not yet been published.',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'List of existing changesets',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  changesets: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Changeset' },
                  },
                  total: {
                    type: 'number',
                    description: 'Total number of changesets',
                  },
                },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '500': { description: 'Internal server error' },
      },
    },
    post: {
      tags: ['Publish'],
      summary: 'Create a new changeset',
      operationId: 'createChangeset',
      description:
        'Creates a new changeset for selected packages with specified version bumps. Requires write permission.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['packages', 'summary'],
              properties: {
                packages: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of package names to include in changeset',
                },
                bumps: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/VersionBump' },
                  description:
                    'Version bump specifications for packages (optional, defaults to patch)',
                },
                summary: {
                  type: 'string',
                  minLength: 10,
                  description: 'Summary of changes (minimum 10 characters)',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Changeset created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  changeset: { $ref: '#/components/schemas/Changeset' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid request - missing or invalid parameters',
        },
        '401': { description: 'Unauthorized - authentication required' },
        '403': {
          description: 'Forbidden - insufficient permissions (write required)',
        },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/publish/preview': {
    post: {
      tags: ['Publish'],
      summary: 'Preview the publish plan',
      operationId: 'previewPublish',
      description:
        'Calculates and previews a publish plan including new versions, affected packages, and validation checks.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['packages'],
              properties: {
                packages: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of package names to preview',
                },
                bumps: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/VersionBump' },
                  description: 'Version bump specifications (optional)',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Publish preview calculated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PublishPreview' },
            },
          },
        },
        '400': { description: 'Invalid request parameters' },
        '401': { description: 'Unauthorized - authentication required' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/publish/status': {
    get: {
      tags: ['Publish'],
      summary: 'Check publish readiness status',
      operationId: 'checkPublishStatus',
      description:
        'Checks if the repository is ready for publishing (clean working tree, changesets exist, etc.).',
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Publish status retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  status: { $ref: '#/components/schemas/PublishStatus' },
                },
              },
            },
          },
        },
        '401': { description: 'Unauthorized - authentication required' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/publish/trigger': {
    post: {
      tags: ['Publish'],
      summary: 'Trigger the publishing workflow',
      operationId: 'triggerPublish',
      description:
        'Triggers the GitHub Actions release/publish workflow. Requires maintain permission and clean working tree.',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                packages: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      newVersion: { type: 'string' },
                      bumpType: {
                        type: 'string',
                        enum: ['major', 'minor', 'patch'],
                      },
                    },
                  },
                  description: 'Array of packages to publish with version info',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Publishing workflow triggered successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  result: {
                    type: 'object',
                    properties: {
                      workflow_runs: {
                        type: 'array',
                        items: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          description:
            'Invalid request - working tree not clean or no changesets',
        },
        '401': { description: 'Unauthorized - authentication required' },
        '403': {
          description:
            'Forbidden - insufficient permissions (maintain required)',
        },
        '500': { description: 'Internal server error' },
      },
    },
  },
};

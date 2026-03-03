/**
 * Swagger API Documentation Configuration
 * Defines OpenAPI specification for MonoDog API
 */
import { appConfig } from "../config-loader";
export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MonoDog API',
    version: '1.0.0',
    description: 'Monorepo Analytics and Health Dashboard API',
    contact: {
      name: 'MonoDog Team',
      url: 'https://github.com/mindfiredigital/monodog',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: `http://${appConfig.server.host}:${appConfig.server.port}/api`,
      description: 'Development server',
    },

  ],
  paths: {
    '/auth/login': {
      get: {
        tags: ['Authentication'],
        summary: 'Initiate GitHub OAuth login',
        operationId: 'initiateLogin',
        description: 'Starts the GitHub OAuth authentication flow and returns the authorization URL',
        parameters: [
          {
            name: 'redirect',
            in: 'query',
            required: false,
            description: 'URL to redirect to after successful authentication',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'OAuth login initiated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    authUrl: { type: 'string', description: 'GitHub OAuth authorization URL' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/auth/callback': {
      get: {
        tags: ['Authentication'],
        summary: 'Handle GitHub OAuth callback',
        operationId: 'handleOAuthCallback',
        description: 'Processes the OAuth callback from GitHub with authorization code and state',
        parameters: [
          {
            name: 'code',
            in: 'query',
            required: true,
            description: 'GitHub OAuth authorization code',
            schema: { type: 'string' },
          },
          {
            name: 'state',
            in: 'query',
            required: true,
            description: 'State parameter for CSRF protection',
            schema: { type: 'string' },
          },
          {
            name: 'error',
            in: 'query',
            required: false,
            description: 'OAuth error code if authentication failed',
            schema: { type: 'string' },
          },
          {
            name: 'error_description',
            in: 'query',
            required: false,
            description: 'Detailed error message from OAuth provider',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'OAuth callback processed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    sessionToken: { type: 'string', description: 'Session token for authenticated requests' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid request parameters or OAuth error' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user session',
        operationId: 'getCurrentSession',
        description: 'Retrieves the current authenticated user session information',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'User session retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                        email: { type: 'string' },
                      },
                    },
                    permissions: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'User repository permissions',
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized - no valid session' },
        },
      },
    },
    '/auth/validate': {
      post: {
        tags: ['Authentication'],
        summary: 'Validate current session',
        operationId: 'validateSession',
        description: 'Validates the current user session and checks if it is still valid',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Session validation result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    valid: { type: 'boolean', description: 'Whether the session is valid' },
                    user: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        username: { type: 'string' },
                      },
                    },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized - session invalid or expired' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Authentication'],
        summary: 'Logout user',
        operationId: 'logoutUser',
        description: 'Logs out the current user and invalidates their session',
        responses: {
          '200': {
            description: 'User logged out successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Authentication'],
        summary: 'Refresh user session',
        operationId: 'refreshSession',
        description: 'Refreshes the current user session and extends the expiration time',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Session refreshed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    sessionToken: { type: 'string', description: 'New session token' },
                    expiresAt: { type: 'string', format: 'date-time', description: 'Session expiration time' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized - session invalid or expired' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/packages': {
      get: {
        tags: ['Packages'],
        summary: 'Get all packages',
        operationId: 'getPackages',
        responses: {
          '200': {
            description: 'List of packages',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Package' } },
              },
            },
          },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/packages/{name}': {
      get: {
        tags: ['Packages'],
        summary: 'Get package by name',
        operationId: 'getPackageByName',
        parameters: [{ name: 'name', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'Package details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Package' },
              },
            },
          },
          '404': { description: 'Package not found' },
        },
      },
    },
    '/packages/refresh': {
      post: {
        tags: ['Packages'],
        summary: 'Refresh packages',
        operationId: 'refreshPackages',
        responses: {
          '200': { description: 'Packages refreshed successfully' },
        },
      },
    },
    '/packages/update-config': {
      put: {
        tags: ['Packages'],
        summary: 'Update package configuration',
        operationId: 'updatePackageConfig',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Package' },
            },
          },
        },
        responses: {
          '200': { description: 'Package configuration updated successfully' },
          '400': { description: 'Invalid request' },
          '404': { description: 'Package not found' },
        },
      },
    },
    '/health/packages': {
      get: {
        tags: ['Health'],
        summary: 'Get packages health status',
        operationId: 'getPackagesHealth',
        responses: {
          '200': {
            description: 'Health status of all packages',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/PackageHealth' } },
              },
            },
          },
        },
      },
    },
    '/health/refresh': {
      post: {
        tags: ['Health'],
        summary: 'Refresh health status',
        operationId: 'refreshHealth',
        responses: {
          '200': { description: 'Health status refreshed successfully' },
        },
      },
    },
    '/commits/{packagePath}': {
      get: {
        tags: ['Commits'],
        summary: 'Get commits for a package',
        operationId: 'getCommits',
        parameters: [{ name: 'packagePath', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': {
            description: 'List of commits',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Commit' } },
              },
            },
          },
        },
      },
    },
    '/config/files': {
      get: {
        tags: ['Configuration'],
        summary: 'Get configuration files',
        operationId: 'getConfigFiles',
        responses: {
          '200': {
            description: 'List of configuration files',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/ConfigFile' } },
              },
            },
          },
        },
      },
    },
    '/config/files/{id}': {
      put: {
        tags: ['Configuration'],
        summary: 'Update configuration file',
        operationId: 'updateConfigFile',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ConfigFile' },
            },
          },
        },
        responses: {
          '200': { description: 'Configuration file updated successfully' },
          '400': { description: 'Invalid request' },
          '404': { description: 'Configuration file not found' },
        },
      },
    },
    '/publish/packages': {
      get: {
        tags: ['Publish'],
        summary: 'Get all workspace packages for publishing',
        operationId: 'getPublishPackages',
        description: 'Retrieves all public packages in the workspace that can be published. Private packages are filtered out.',
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
                    total: { type: 'number', description: 'Total number of packages' },
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
        description: 'Retrieves all existing changesets that have not yet been published.',
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
                    total: { type: 'number', description: 'Total number of changesets' },
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
        description: 'Creates a new changeset for selected packages with specified version bumps. Requires write permission.',
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
                    description: 'Version bump specifications for packages (optional, defaults to patch)',
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
          '400': { description: 'Invalid request - missing or invalid parameters' },
          '401': { description: 'Unauthorized - authentication required' },
          '403': { description: 'Forbidden - insufficient permissions (write required)' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/publish/preview': {
      post: {
        tags: ['Publish'],
        summary: 'Preview the publish plan',
        operationId: 'previewPublish',
        description: 'Calculates and previews a publish plan including new versions, affected packages, and validation checks.',
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
        description: 'Checks if the repository is ready for publishing (clean working tree, changesets exist, etc.).',
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
        description: 'Triggers the GitHub Actions release/publish workflow. Requires maintain permission and clean working tree.',
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
                        bumpType: { type: 'string', enum: ['major', 'minor', 'patch'] },
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
          '400': { description: 'Invalid request - working tree not clean or no changesets' },
          '401': { description: 'Unauthorized - authentication required' },
          '403': { description: 'Forbidden - insufficient permissions (maintain required)' },
          '500': { description: 'Internal server error' },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'GitHub OAuth authentication and session management endpoints',
    },
    {
      name: 'Packages',
      description: 'Package management and analysis endpoints',
    },
    {
      name: 'Health',
      description: 'Health monitoring and status endpoints',
    },
    {
      name: 'Commits',
      description: 'Git commit history and analysis endpoints',
    },
    {
      name: 'Configuration',
      description: 'Configuration file management endpoints',
    },
    {
      name: 'Publish',
      description: 'Generate Changeset and publish packages endpoints',
    },
  ],
  components: {
    schemas: {
      Package: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Package name',
          },
          path: {
            type: 'string',
            description: 'Package path in monorepo',
          },
          version: {
            type: 'string',
            description: 'Package version',
          },
          size: {
            type: 'number',
            description: 'Package size in bytes',
          },
          dependencies: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'List of package dependencies',
          },
        },
      },
      PackageHealth: {
        type: 'object',
        properties: {
          packageName: {
            type: 'string',
            description: 'Name of the package',
          },
          healthScore: {
            type: 'number',
            description: 'Health score (0-100)',
            minimum: 0,
            maximum: 100,
          },
          lintStatus: {
            type: 'string',
            enum: ['pass', 'warning', 'fail'],
            description: 'Linting status',
          },
          buildStatus: {
            type: 'string',
            enum: ['success', 'failed', 'pending'],
            description: 'Build status',
          },
          securityStatus: {
            type: 'string',
            enum: ['secure', 'warning', 'vulnerable'],
            description: 'Security status',
          },
          testCoverage: {
            type: 'number',
            description: 'Test coverage percentage',
          },
        },
      },
      Commit: {
        type: 'object',
        properties: {
          hash: {
            type: 'string',
            description: 'Commit hash',
          },
          author: {
            type: 'string',
            description: 'Commit author',
          },
          message: {
            type: 'string',
            description: 'Commit message',
          },
          date: {
            type: 'string',
            format: 'date-time',
            description: 'Commit date',
          },
          filesChanged: {
            type: 'number',
            description: 'Number of files changed',
          },
        },
      },
      ConfigFile: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Configuration file ID',
          },
          name: {
            type: 'string',
            description: 'Configuration file name',
          },
          path: {
            type: 'string',
            description: 'Configuration file path',
          },
          content: {
            type: 'string',
            description: 'Configuration file content',
          },
        },
      },
      ReleasePipeline: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique pipeline ID',
          },
          releaseVersion: {
            type: 'string',
            description: 'Release version number',
          },
          packageName: {
            type: 'string',
            description: 'Name of the package being released',
          },
          owner: {
            type: 'string',
            description: 'Repository owner',
          },
          repo: {
            type: 'string',
            description: 'Repository name',
          },
          workflowId: {
            type: 'string',
            description: 'GitHub workflow ID',
          },
          workflowName: {
            type: 'string',
            description: 'GitHub workflow name',
          },
          workflowPath: {
            type: 'string',
            description: 'Path to the workflow file',
          },
          triggerType: {
            type: 'string',
            description: 'Type of trigger (e.g., "manual", "scheduled")',
          },
          triggeredBy: {
            type: 'string',
            description: 'Username of who triggered the release',
          },
          triggeredAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the pipeline was triggered',
          },
          currentStatus: {
            type: 'string',
            enum: ['queued', 'in_progress', 'completed'],
            description: 'Current pipeline status',
          },
          currentConclusion: {
            type: 'string',
            enum: ['success', 'failure', 'cancelled', 'skipped', 'neutral'],
            description: 'Pipeline conclusion result',
          },
          lastRunId: {
            type: 'string',
            description: 'ID of the last workflow run',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the pipeline record was created',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the pipeline record was last updated',
          },
        },
      },
      PublishPackage: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Package name',
          },
          path: {
            type: 'string',
            description: 'Package path in the monorepo',
          },
          version: {
            type: 'string',
            description: 'Current version of the package',
          },
          private: {
            type: 'boolean',
            description: 'Whether the package is private',
          },
          dependencies: {
            type: 'object',
            additionalProperties: { type: 'string' },
            description: 'Package dependencies',
          },
          devDependencies: {
            type: 'object',
            additionalProperties: { type: 'string' },
            description: 'Dev dependencies',
          },
        },
      },
      Changeset: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Changeset ID or filename',
          },
          packages: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of packages affected by this changeset',
          },
          summary: {
            type: 'string',
            description: 'Summary of changes in the changeset',
          },
          author: {
            type: 'string',
            description: 'GitHub username of the changeset author',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the changeset was created',
          },
        },
      },
      VersionBump: {
        type: 'object',
        required: ['package', 'bumpType'],
        properties: {
          package: {
            type: 'string',
            description: 'Package name',
          },
          bumpType: {
            type: 'string',
            enum: ['major', 'minor', 'patch'],
            description: 'Type of version bump to apply',
          },
        },
      },
      PublishPreview: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the preview was successful',
          },
          isValid: {
            type: 'boolean',
            description: 'Whether the publish operation is valid and can proceed',
          },
          errors: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of validation errors that prevent publishing',
          },
          warnings: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of validation warnings',
          },
          checks: {
            type: 'object',
            properties: {
              permissions: {
                type: 'boolean',
                description: 'Whether the user has sufficient permissions',
              },
              workingTreeClean: {
                type: 'boolean',
                description: 'Whether the working tree is clean',
              },
              ciPassing: {
                type: 'boolean',
                description: 'Whether the latest CI run passed',
              },
              versionAvailable: {
                type: 'boolean',
                description: 'Whether the new versions are available on npm',
              },
            },
            description: 'Individual validation check results',
          },
          preview: {
            type: 'object',
            properties: {
              packages: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    package: { type: 'string' },
                    oldVersion: { type: 'string' },
                    newVersion: { type: 'string' },
                    bumpType: { type: 'string' },
                  },
                },
                description: 'Package version changes in the preview',
              },
              workingTreeClean: {
                type: 'boolean',
              },
              existingChangesets: {
                type: 'number',
                description: 'Number of existing changesets',
              },
              affectedPackages: {
                type: 'number',
                description: 'Number of affected packages',
              },
            },
            description: 'Preview details',
          },
        },
      },
      PublishStatus: {
        type: 'object',
        properties: {
          workingTreeClean: {
            type: 'boolean',
            description: 'Whether the working tree is clean',
          },
          hasChangesets: {
            type: 'boolean',
            description: 'Whether there are existing changesets',
          },
          changesetCount: {
            type: 'number',
            description: 'Number of existing changesets',
          },
          readyToPublish: {
            type: 'boolean',
            description: 'Whether the repository is ready to publish',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
          message: {
            type: 'string',
            description: 'Detailed error message',
          },
          code: {
            type: 'string',
            description: 'Error code',
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Unauthorized access',
      },
      NotFoundError: {
        description: 'Resource not found',
      },
      InternalServerError: {
        description: 'Internal server error',
      },
    },
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your session token in the format: Bearer YOUR_SESSION_TOKEN',
      },
    },
  },
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [], // Using only definition, no JSDoc file scanning
};

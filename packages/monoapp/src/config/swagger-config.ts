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

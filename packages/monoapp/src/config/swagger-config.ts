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
  },
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [], // Using only definition, no JSDoc file scanning
};

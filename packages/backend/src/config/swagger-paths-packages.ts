/**
 * Swagger Packages, Health, Commits & Config Paths
 * Package management, health monitoring, and configuration endpoints
 */

export const packagesPaths = {
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
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Package' },
              },
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
      parameters: [
        {
          name: 'name',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
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
    get: {
      tags: ['Packages'],
      summary: 'Refresh packages',
      operationId: 'refreshPackages',
      responses: {
        '200': { description: 'Packages refreshed successfully' },
      },
    },
  },
  '/packages/sync-npm': {
    post: {
      tags: ['Packages'],
      summary: 'Sync NPM data for packages',
      operationId: 'syncNpmData',
      responses: {
        '200': { description: 'NPM data synced successfully' },
        '500': { description: 'Internal server error' },
      },
    },
  },
  '/packages/update': {
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
  '/changelog/{packageName}': {
    get: {
      tags: ['Packages'],
      summary: 'Release changelogs for a package',
      operationId: 'getPackageChangelog',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'packageName',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: 'URL-encoded package name',
        },
        {
          name: 'owner',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'GitHub repo owner',
        },
        {
          name: 'repo',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'GitHub repo name',
        },
      ],
      responses: {
        '200': {
          description: 'Successfully retrieved version history',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/ReleaseData' },
              },
            },
          },
        },
        '404': {
          $ref: '#/components/responses/NotFoundError',
        },
      },
    },
  },
};

export const healthPaths = {
  '/health': {
    get: {
      tags: ['Health'],
      summary: 'Get backend health status',
      operationId: 'getHealth',
      responses: {
        '200': { description: 'Backend is healthy' },
      },
    },
  },
  '/health/live': {
    get: {
      tags: ['Health'],
      summary: 'Get backend live status',
      operationId: 'getLiveStatus',
      responses: {
        '200': { description: 'Backend is live' },
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
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/PackageHealth' },
              },
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
  '/health/packages/{name}': {
    get: {
      tags: ['Health'],
      summary: 'Get specific package health status',
      operationId: 'getPackageHealth',
      parameters: [
        {
          name: 'name',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': { description: 'Package health status' },
        '404': { description: 'Package not found' },
      },
    },
  },
};

export const commitsPaths = {
  '/commits/{packagePath}': {
    get: {
      tags: ['Commits'],
      summary: 'Get commits for a package',
      operationId: 'getCommits',
      parameters: [
        {
          name: 'packagePath',
          in: 'path',
          required: true,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'List of commits',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Commit' },
              },
            },
          },
        },
      },
    },
  },
};

export const configPaths = {
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
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/ConfigFile' },
              },
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
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
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
};

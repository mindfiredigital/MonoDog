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
};

export const healthPaths = {
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

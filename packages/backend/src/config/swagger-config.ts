/**
 * Swagger API Documentation Configuration
 * Main configuration file that assembles OpenAPI specification for MonoDog API
 *
 * Imports API paths, schemas, and other components from dedicated modules
 * for better maintainability and organization.
 */
import { appConfig } from '../config-loader';
import { swaggerPaths, swaggerTags } from './swagger-paths';
import { swaggerSchemas } from './swagger-schemas';

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
  paths: swaggerPaths,
  tags: swaggerTags,
  components: swaggerSchemas,
};

export const swaggerOptions = {
  definition: swaggerDefinition,
  apis: [], // Using only definition, no JSDoc file scanning
};

/**
 * Swagger Documentation Middleware
 * Sets up Swagger UI for API documentation
 */

import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import type { Express, Request, Response } from 'express';
import { swaggerOptions } from '../config/swagger-config';

/**
 * Setup Swagger documentation endpoint
 * @param app Express application instance
 */
export function setupSwaggerDocs(app: Express): void {
  try {
    const specs = swaggerJsDoc(swaggerOptions) as Record<string, unknown>;

    // Serve raw Swagger JSON FIRST (before the middleware catches all /api-docs paths)
    app.get('/api-docs/swagger.json', (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'application/json');
      res.send(specs);
    });

    // Serve Swagger UI at /api-docs
    app.use(
      '/api-docs',
      swaggerUi.serve,
      swaggerUi.setup(specs, {
        swaggerOptions: {
          url: '/api-docs/swagger.json',
          persistAuthorization: true,
          displayOperationId: true,
          filter: true,
          showExtensions: true,
        },
        customCss: `
          .swagger-ui .topbar {
            background-color: #2c3e50;
          }
          .swagger-ui .info .title {
            color: #2c3e50;
            font-weight: bold;
          }
          .swagger-ui .btn-box .btn {
            background-color: #2c3e50;
          }
        `,
        customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      })
    );

    console.log('Swagger documentation available at /api-docs');
  } catch (error) {
    console.error('Failed to setup Swagger documentation:', error);
  }
}

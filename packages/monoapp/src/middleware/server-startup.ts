/**
 * Server startup logic for the API backend
 */

import express from 'express';
import { json } from 'body-parser';
import type { Express } from 'express';
import { httpLogger, AppLogger } from './logger';

import { appConfig } from '../config-loader';
import {
  errorHandler,
  notFoundHandler,
} from './error-handler';
import {
  createHelmetMiddleware,
  createApiCorsMiddleware,
  createTimeoutMiddleware,
  buildApiUrl,
  buildDashboardUrl,
} from './security';

import packageRouter from '../routes/package-routes';
import commitRouter from '../routes/commit-routes';
import healthRouter from '../routes/health-routes';
import configRouter from '../routes/config-routes';

// Security constants
const PORT_MIN = 1024;
const PORT_MAX = 65535;

/**
 * Validate port number
 */
function validatePort(port: string | number): number {
  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(portNum) || portNum < PORT_MIN || portNum > PORT_MAX) {
    throw new Error(`Port must be between ${PORT_MIN} and ${PORT_MAX}`);
  }

  return portNum;
}

/**
 * Create Express app with middleware configuration
 */
function createApp(rootPath: string): Express {
  const app = express();

  // Timeout middleware
  app.use(createTimeoutMiddleware());

  // Store root path for routes
  app.locals.rootPath = rootPath;

  // Security and CORS setup
  const dashboardUrl = buildDashboardUrl(appConfig);
  const apiUrl = buildApiUrl(appConfig.server.host, appConfig.server.port);

  app.use(createHelmetMiddleware(apiUrl));
  app.use(createApiCorsMiddleware(dashboardUrl));

  // Body parser
  app.use(json({ limit: '1mb' }));

  // HTTP request logging with Morgan
  app.use(httpLogger);

  // Routes
  app.use('/api/packages', packageRouter);
  app.use('/api/commits/', commitRouter);
  app.use('/api/health/', healthRouter);
  app.use('/api/config/', configRouter);

  // 404 handler
  app.use('*', notFoundHandler);

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the API server
 */
export function startServer(rootPath: string): void {
  try {
    const port = appConfig.server.port;
    const host = appConfig.server.host;
    const validatedPort = validatePort(port);

    AppLogger.info(`Starting Monodog API server...`);
    AppLogger.info(`Analyzing monorepo at root: ${rootPath}`);

    const app = createApp(rootPath);

    const server = app.listen(validatedPort, host, () => {
      console.log(`Backend server listening on http://${host}:${validatedPort}`);
      AppLogger.info('API endpoints available:', {
        endpoints: [
          'GET  /api/health',
          'GET  /api/packages/refresh',
          'GET  /api/packages',
          'GET  /api/packages/:name',
          'PUT  /api/packages/update-config',
          'GET  /api/commits/:packagePath',
          'GET  /api/health/packages',
          'PUT  /api/config/files/:id',
          'GET  /api/config/files',
        ],
      });
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        AppLogger.error(`Port ${validatedPort} is already in use. Please specify a different port.`, err);
        process.exit(1);
      } else if (err.code === 'EACCES') {
        AppLogger.error(`Permission denied to listen on port ${validatedPort}. Use a port above 1024.`, err);
        process.exit(1);
      } else {
        AppLogger.error('Server failed to start:', err);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      AppLogger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        AppLogger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    AppLogger.error('Failed to start server:', err);
    process.exit(1);
  }
}

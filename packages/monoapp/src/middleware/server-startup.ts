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
import {
  PORT_MIN,
  PORT_MAX,
  PORT_VALIDATION_ERROR_MESSAGE,
  BODY_PARSER_LIMIT,
  SUCCESS_SERVER_START,
  ERROR_PORT_IN_USE,
  ERROR_PERMISSION_DENIED,
  MESSAGE_GRACEFUL_SHUTDOWN,
  MESSAGE_SERVER_CLOSED,
} from '../constants';

/**
 * Validate port number
 */
function validatePort(port: string | number): number {
  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(portNum) || portNum < PORT_MIN || portNum > PORT_MAX) {
    throw new Error(PORT_VALIDATION_ERROR_MESSAGE(PORT_MIN, PORT_MAX));
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
  app.use(json({ limit: BODY_PARSER_LIMIT }));

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
      console.log(SUCCESS_SERVER_START(host, validatedPort));
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
        AppLogger.error(ERROR_PORT_IN_USE(validatedPort), err);
        process.exit(1);
      } else if (err.code === 'EACCES') {
        AppLogger.error(ERROR_PERMISSION_DENIED(validatedPort), err);
        process.exit(1);
      } else {
        AppLogger.error('Server failed to start:', err);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      AppLogger.info(MESSAGE_GRACEFUL_SHUTDOWN);
      server.close(() => {
        AppLogger.info(MESSAGE_SERVER_CLOSED);
        process.exit(0);
      });
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    AppLogger.error('Failed to start server:', err);
    process.exit(1);
  }
}

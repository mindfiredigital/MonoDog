/**
 * Dashboard server startup logic
 */

import express from 'express';
import path from 'path';
import type { Express } from 'express';
import { httpLogger, AppLogger } from './logger';

import { appConfig } from '../config-loader';
import {
  errorHandler,
} from './error-handler';
import {
  createHelmetMiddleware,
  createDashboardCorsMiddleware,
  createTimeoutMiddleware,
  buildApiUrl,
} from './security';

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
 * Create Express app for dashboard with middleware
 */
function createDashboardApp(): Express {
  const app = express();

  // Timeout middleware
  app.use(createTimeoutMiddleware());

  // Security setup
  const serverHost = appConfig.server.host === '0.0.0.0'
    ? 'localhost'
    : appConfig.server.host;
  const apiUrl = buildApiUrl(serverHost, appConfig.server.port);

  app.use(createHelmetMiddleware(apiUrl));
  app.use(createDashboardCorsMiddleware());

  // Environment config endpoint
  app.get('/env-config.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    res.send(
      `window.ENV = { API_URL: "${apiUrl}" };`
    );
  });

  // Request logging
  app.use(httpLogger);

  // SPA routing: serve index.html for non-static routes
  app.use((_req, _res, next) => {
    if (/(.ico|.js|.css|.jpg|.png|.map|.woff|.woff2|.ttf)$/i.test(_req.path)) {
      next();
    } else {
      _res.header(
        'Cache-Control',
        'private, no-cache, no-store, must-revalidate'
      );
      _res.header('Expires', '-1');
      _res.header('Pragma', 'no-cache');
      _res.sendFile('index.html', {
        root: path.resolve(__dirname, '..', '..', 'monodog-dashboard', 'dist'),
      }, (err: Error | null) => {
        if (err) {
          AppLogger.error('Error serving index.html:', err);
          _res.status(500).json({ error: 'Internal server error' });
        }
      });
    }
  });

  // Static files
  const staticPath = path.join(__dirname, '..', '..', 'monodog-dashboard', 'dist');
  AppLogger.debug('Serving static files from:', { path: staticPath });
  app.use(express.static(staticPath, {
    maxAge: '1d',
    etag: false,
    dotfiles: 'deny',
  }));

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the dashboard server
 */
export function serveDashboard(rootPath: string): void {
  try {
    const port = appConfig.dashboard.port;
    const host = appConfig.dashboard.host;
    const validatedPort = validatePort(port);

    const app = createDashboardApp();

    const server = app.listen(validatedPort, host, () => {
      console.log(`Dashboard listening on http://${host}:${validatedPort}`);
      console.log('Press Ctrl+C to quit.');
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        AppLogger.error(`Port ${validatedPort} is already in use.`, err);
        process.exit(1);
      } else if (err.code === 'EACCES') {
        AppLogger.error(`Permission denied to listen on port ${validatedPort}.`, err);
        process.exit(1);
      } else {
        AppLogger.error('Server failed to start:', err);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      AppLogger.info('SIGTERM signal received: closing dashboard server');
      server.close(() => {
        AppLogger.info('Dashboard server closed');
        process.exit(0);
      });
    });
  } catch (error: unknown) {
    const err = error as Error & { message?: string };
    AppLogger.error('Failed to start dashboard:', err);
    process.exit(1);
  }
}

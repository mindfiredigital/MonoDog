import express, {
  type Request,
  type Response,
  type NextFunction,
  type ErrorRequestHandler,
} from 'express';

import cors from 'cors';
import path from 'path';
import { json } from 'body-parser';
import helmet from 'helmet';

import { appConfig } from './config-loader';

import packageRouter from './routes/packageRoutes';
import commitRouter from './routes/commitRoutes';
import healthRouter from './routes/healthRoutes';
import configRouter from './routes/configRoutes';

// Security constants
const PORT_MIN = 1024;
const PORT_MAX = 65535;

// Validate port number
function validatePort(port: string | number): number {
  const portNum = typeof port === 'string' ? parseInt(port, 10) : port;

  if (isNaN(portNum) || portNum < PORT_MIN || portNum > PORT_MAX) {
    throw new Error(`Port must be between ${PORT_MIN} and ${PORT_MAX}`);
  }

  return portNum;
}

// Global error handler
const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  console.error('[ERROR]', {
    status,
    method: req.method,
    path: req.path,
    message: err.message,
  });

  res.status(status).json({
    error: 'Internal server error'
  });
};

// The main function exported and called by the CLI
export function startServer(
  rootPath: string
): void {

  try {
    const port = appConfig.server.port;
    const host = appConfig.server.host;
    const validatedPort = validatePort(port);
    const app = express();

    // Set request timeout (30 seconds)
    app.use((req, res, next) => {
      req.setTimeout(30000);
      res.setTimeout(30000);
      next();
    });

    app.locals.rootPath = rootPath;

    // Security middleware with CSP allowing API calls
    const apiHost = host === '0.0.0.0' ? 'localhost' : host;
    const apiUrl = process.env.API_URL || `http://${apiHost}:${validatedPort}`;
    const dashboardHost = appConfig.dashboard.host === '0.0.0.0' ? 'localhost' : appConfig.dashboard.host;
    const dashboardUrl = `http://${dashboardHost}:${appConfig.dashboard.port}`;

    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", apiUrl, 'http://localhost:*', 'http://127.0.0.1:*'],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }));
    app.use(cors({
      origin: process.env.CORS_ORIGIN || dashboardUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    app.use(json({ limit: '1mb' }));

    // Request logging middleware (safe version)
    app.use((_req: Request, _res: Response, next: NextFunction) => {
      console.log(`[${new Date().toISOString()}] ${_req.method} ${_req.path}`);
      next();
    });

    app.use('/api/packages', packageRouter);

    // Get commit details
    app.use('/api/commits/', commitRouter);

    // Health check endpoint
    app.use('/api/health/', healthRouter);

    // Configuration endpoint
    app.use('/api/config/', configRouter);

    // 404 handler
    app.use('*', (_, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        timestamp: Date.now(),
      });
    });

    // Global error handler (must be last)
    app.use(errorHandler);

    const server = app.listen(validatedPort, host, () => {
      console.log(`🚀 Backend server running on http://${host}:${validatedPort}`);
      console.log(`📊 API endpoints available:`);
      console.log(`   - GET  /api/health`);
      console.log(`   - GET  /api/packages/refresh`);
      console.log(`   - GET  /api/packages`);
      console.log(`   - GET  /api/packages/:name`);
      console.log(`   - PUT  /api/packages/update-config`);
      console.log(`   - GET  /api/commits/:packagePath`);
      console.log(`   - GET  /api/health/packages`);
      console.log(`   - PUT  /api/config/files/:id`);
      console.log(`   - GET  /api/config/files`);
    });

    server.on('error', (err: any) => {
      // Handle common errors like EADDRINUSE (port already in use)
      if (err.code === 'EADDRINUSE') {
        console.error(
          `Error: Port ${validatedPort} is already in use. Please specify a different port.`
        );
        process.exit(1);
      } else if (err.code === 'EACCES') {
        console.error(
          `Error: Permission denied to listen on port ${validatedPort}. Use a port above 1024.`
        );
        process.exit(1);
      } else {
        console.error('Server failed to start:', err.message);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

export function serveDashboard(
  rootPath: string
): void {
  try {
    const port = appConfig.dashboard.port;
    const host = appConfig.dashboard.host;
    const validatedPort = validatePort(port);
    const app = express();

    // Security middleware
    const serverHost = appConfig.server.host === '0.0.0.0' ? 'localhost' : appConfig.server.host;
    const apiUrl = process.env.API_URL || `http://${serverHost}:${appConfig.server.port}`;
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", apiUrl, 'http://localhost:*', 'http://127.0.0.1:*'],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }));

    // Strict CORS for dashboard
    app.use(cors({
      origin: false, // Don't allow any origin for static assets
    }));

    // Set request timeout
    app.use((req, res, next) => {
      req.setTimeout(30000);
      res.setTimeout(30000);
      next();
    });

    app.get('/env-config.js', (req, res) => {
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');

      const serverHost = appConfig.server.host === '0.0.0.0' ? 'localhost' : appConfig.server.host;
      const apiUrl = process.env.API_URL || `http://${serverHost}:${appConfig.server.port}`;
      res.send(
        `window.ENV = { API_URL: "${apiUrl}" };`
      );
    });

    // This code makes sure that any request that does not matches a static file
    // in the build folder, will just serve index.html. Client side routing is
    // going to make sure that the correct content will be loaded.
    app.use((req, res, next) => {
      if (/(.ico|.js|.css|.jpg|.png|.map|.woff|.woff2|.ttf)$/i.test(req.path)) {
        next();
      } else {
        res.header(
          'Cache-Control',
          'private, no-cache, no-store, must-revalidate'
        );
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        res.sendFile('index.html', {
          root: path.resolve(__dirname, '..', 'monodog-dashboard', 'dist'),
        }, (err) => {
          if (err) {
            console.error('Error serving index.html:', err.message);
            res.status(500).json({ error: 'Internal server error' });
          }
        });
      }
    });

    const staticPath = path.join(__dirname, '..', 'monodog-dashboard', 'dist');
    console.log('Serving static files from:', staticPath);
    app.use(express.static(staticPath, {
      maxAge: '1d',
      etag: false,
      dotfiles: 'deny', // Don't serve dot files
    }));

    // Global error handler
    app.use(errorHandler);

    const server = app.listen(validatedPort, host, () => {
      console.log(`✅ Dashboard listening on http://${host}:${validatedPort}`);
      console.log('Press Ctrl+C to quit.');
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Error: Port ${validatedPort} is already in use.`);
        process.exit(1);
      } else if (err.code === 'EACCES') {
        console.error(`Error: Permission denied to listen on port ${validatedPort}.`);
        process.exit(1);
      } else {
        console.error('Server failed to start:', err.message);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing dashboard server');
      server.close(() => {
        console.log('Dashboard server closed');
        process.exit(0);
      });
    });
  } catch (error: any) {
    console.error('Failed to start dashboard:', error.message);
    process.exit(1);
  }
}

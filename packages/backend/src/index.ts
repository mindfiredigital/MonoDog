import 'dotenv/config';
import fs from 'fs';
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { json } from 'body-parser';
import apiRouter from './routes';
import { prisma } from './db/prisma';

export { scanner } from './services/scan.service';

// The main function exported and called by the CLI
export function startServer(
  rootPath: string,
  port: number | string,
  host: string
): void {
  const app = express();

  // Store rootPath for routes to access
  app.locals.rootPath = rootPath;

  // Logging Middleware
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    console.log(`[SERVER] ${_req.method} ${_req.url} (Root: ${rootPath})`);
    next();
  });

  // CORS configuration - allow credentials with specific origins
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:4173',
      ];

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Cookie parser middleware
  app.use(cookieParser());
  app.use(json());

  // Mount API router
  app.use('/api', apiRouter);

  // Error handling middleware
  app.use(
    (
      error: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error('Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: Date.now(),
      });
    }
  );

  // 404 handler
  app.use('*', (_, res) => {
    res.status(404).json({
      error: 'Endpoint not found',
      timestamp: Date.now(),
    });
  });

  const PORT = parseInt(port ? port.toString() : '4000');

  app
    .listen(PORT, host, async () => {
      const pcount = await prisma.package.count();
      console.log(`[Database] Total packages found: ${pcount}`);

      console.log(`Backend server running on http://${host}:${PORT}`);
      console.log(`API endpoints available on /api`);
    })
    .on('error', (err: any) => {
      // Handle common errors like EADDRINUSE (port already in use)
      if (err.message.includes('EADDRINUSE')) {
        console.error(
          `Error: Port ${port} is already in use. Please specify a different port via configuration file.`
        );
        process.exit(1);
      } else {
        console.error('Server failed to start:', err);
        process.exit(1);
      }
    });
}

export function serveDashboard(
  rootPath: string,
  port: number | string,
  host: string
): void {
  const app = express();

  // This code makes sure that any request that does not matches a static file
  // in the build folder, will just serve index.html. Client side routing is
  // going to make sure that the correct content will be loaded.
  app.use((req, res, next) => {
    if (/(.ico|.js|.css|.jpg|.png|.map)$/i.test(req.path)) {
      next();
    } else {
      res.header(
        'Cache-Control',
        'private, no-cache, no-store, must-revalidate'
      );
      res.header('Expires', '-1');
      res.header('Pragma', 'no-cache');
      res.sendFile('index.html', {
        root: path.resolve(rootPath, 'apps', 'dashboard', 'dist'),
      });
    }
  });

  const staticPath = path.resolve(rootPath, 'apps', 'dashboard', 'dist');
  const indexHtmlPath = path.join(staticPath, 'index.html');

  if (!fs.existsSync(indexHtmlPath)) {
    console.error(`Dashboard build not found at ${indexHtmlPath}.`);
    console.error(
      'Please build the dashboard first with: pnpm --dir apps/dashboard run build'
    );
    process.exit(1);
  }
  console.log('Serving static files from:', staticPath);
  app.use(express.static(staticPath));

  // Start the server
  const PORT = parseInt(port ? port.toString() : '8999');

  app.listen(PORT, host, () => {
    console.log(`App listening on ${host}:${port}`);
    console.log('Press Ctrl+C to quit.');
  });
}

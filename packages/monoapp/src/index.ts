import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';
import path from 'path';
import { json } from 'body-parser';

import { appConfig } from './config-loader';

import packageRouter from './routes/packageRoutes';
import commitRouter from './routes/commitRoutes';
import healthRouter from './routes/healthRoutes';
import configRouter from './routes/configRoutes';
// The main function exported and called by the CLI
export function startServer(
  rootPath: string,
  port: number | string,
  host: string
): void {
  const app = express();
app.locals.rootPath = rootPath;
  // --- Middleware ---

  // 1. Logging Middleware
  app.use((_req: Request, _res: Response, next: NextFunction) => {
    console.log(`[SERVER] ${_req.method} ${_req.url} (Root: ${rootPath})`);
    next();
  });
  app.use(cors());
  app.use(json());


  app.use('/api/packages',  packageRouter);


  // Get commit details
  app.use('/api/commits/', commitRouter);

  // ---------- HEALTH --------------------

  app.use('/api/health/', healthRouter)

  // ------------------------- CONFIGURATION TAB ------------------------- //
  // Get all configuration files from the file system
  app.use('/api/config/', configRouter);

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
      console.log(`🚀 Backend server running on http://${host}:${PORT}`);
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

    })
    .on('error', err => {
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
  app.get('/env-config.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(
      `window.ENV = { API_URL: "${`${appConfig.server.host}:${appConfig.server.port}` || 'localhost:8999'}" };`
    );
  });

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
        root: path.resolve(__dirname, '..', 'monodog-dashboard', 'dist'),
      });
    }
  });
  const staticPath = path.join(__dirname, '..', 'monodog-dashboard', 'dist');
  console.log('Serving static files from:', staticPath);
  app.use(express.static(staticPath));
  // Start the server
  const PORT = parseInt(port ? port.toString() : '8999');

  app.listen(PORT, host, () => {
    console.log(`App listening on ${host}:${port}`);
    console.log('Press Ctrl+C to quit.');
  });
}

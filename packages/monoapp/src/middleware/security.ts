/**
 * Security middleware and configuration
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import type { MonodogConfig } from '../types/config';

/**
 * Create Helmet security middleware with Content Security Policy
 */
export function createHelmetMiddleware(apiUrl: string) {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", apiUrl, 'http://localhost:*', 'http://127.0.0.1:*'],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });
}

/**
 * Create CORS middleware for API server
 */
export function createApiCorsMiddleware(dashboardUrl: string) {
  const corsOptions: CorsOptions = {
    origin: process.env.CORS_ORIGIN || dashboardUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  return cors(corsOptions);
}

/**
 * Create CORS middleware for dashboard (no cross-origin)
 */
export function createDashboardCorsMiddleware() {
  const corsOptions: CorsOptions = {
    origin: false, // Don't allow any origin for static assets
  };

  return cors(corsOptions);
}

/**
 * Request timeout middleware (30 seconds)
 */
export function createTimeoutMiddleware() {
  return (req: Request, res: Response, next: NextFunction): void => {
    req.setTimeout(30000);
    res.setTimeout(30000);
    next();
  };
}

/**
 * Build API URL based on config
 */
export function buildApiUrl(
  host: string,
  port: number
): string {
  const apiHost = host === '0.0.0.0' ? 'localhost' : host;
  return process.env.API_URL || `http://${apiHost}:${port}`;
}

/**
 * Build dashboard URL based on config
 */
export function buildDashboardUrl(config: MonodogConfig): string {
  const dashboardHost = config.dashboard.host === '0.0.0.0'
    ? 'localhost'
    : config.dashboard.host;
  return `http://${dashboardHost}:${config.dashboard.port}`;
}

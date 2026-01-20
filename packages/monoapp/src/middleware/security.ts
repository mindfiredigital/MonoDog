/**
 * Security middleware and configuration
 */

import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import type { MonodogConfig } from '../types/config';
import {
  REQUEST_TIMEOUT,
  RESPONSE_TIMEOUT,
  CORS_API_METHODS,
  CORS_ALLOWED_HEADERS,
  DEFAULT_LOCALHOST,
  WILDCARD_ADDRESS,
  HTTP_PROTOCOL,
} from '../constants';

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
    origin: dashboardUrl,
    credentials: true,
    methods: [...CORS_API_METHODS],
    allowedHeaders: [...CORS_ALLOWED_HEADERS],
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
    req.setTimeout(REQUEST_TIMEOUT);
    res.setTimeout(RESPONSE_TIMEOUT);
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
  const apiHost = host === WILDCARD_ADDRESS ? DEFAULT_LOCALHOST : host;
  return `${HTTP_PROTOCOL}${apiHost}:${port}`;
}

/**
 * Build dashboard URL based on config
 */
export function buildDashboardUrl(config: MonodogConfig): string {
  const dashboardHost = config.dashboard.host === WILDCARD_ADDRESS
    ? DEFAULT_LOCALHOST
    : config.dashboard.host;
  return `${HTTP_PROTOCOL}${dashboardHost}:${config.dashboard.port}`;
}

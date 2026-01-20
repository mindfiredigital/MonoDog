/**
 * Error handling middleware for Express
 */

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppLogger } from './logger';

/**
 * Custom error interface extending Error
 */
export interface CustomError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Global error handler middleware
 * Must be registered last in the middleware chain
 */
export const errorHandler: ErrorRequestHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const status = err.status || err.statusCode || 500;

  AppLogger.error('Request error occurred', {
    status,
    method: req.method,
    path: req.path,
    message: err.message,
    timestamp: new Date().toISOString(),
  });

  res.status(status).json({
    error: 'Internal server error',
    timestamp: Date.now(),
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Endpoint not found',
    timestamp: Date.now(),
  });
};

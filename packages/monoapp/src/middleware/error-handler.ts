/**
 * Error handling middleware for Express
 */

import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

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

  console.error('[ERROR]', {
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

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path}`
  );
  next();
};

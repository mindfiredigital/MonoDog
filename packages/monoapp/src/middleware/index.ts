/**
 * Middleware exports
 */

export { errorHandler, notFoundHandler } from './error-handler';
export type { CustomError } from './error-handler';

export {
  createHelmetMiddleware,
  createApiCorsMiddleware,
  createDashboardCorsMiddleware,
  createTimeoutMiddleware,
  buildApiUrl,
  buildDashboardUrl,
} from './security';

export { startServer } from './server-startup';
export { serveDashboard } from './dashboard-startup';

export { httpLogger, AppLogger } from './logger';

/**
 * Middleware exports
 */

export { errorHandler, notFoundHandler } from './error-handler';
export type { CustomError } from '../types/errors';

export {
  createHelmetMiddleware,
  createApiCorsMiddleware,
  createDashboardCorsMiddleware,
  createTimeoutMiddleware,
  buildApiUrl,
  buildDashboardUrl,
} from './security';

export { serveDashboard } from './dashboard-startup';

export { httpLogger, AppLogger } from './logger';

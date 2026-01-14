/**
 * Monodog Application Entry Point
 *
 * This file exports the main server and dashboard startup functions
 * All middleware, security, and error handling logic has been moved to separate files
 */

export { startServer } from './middleware/server-startup';
export { serveDashboard } from './middleware/dashboard-startup';

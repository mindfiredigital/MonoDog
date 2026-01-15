/**
 * Security Constants
 * Defines security-related configuration and constants
 */

/**
 * Request timeout duration in milliseconds (30 seconds)
 */
export const REQUEST_TIMEOUT = 30000;

/**
 * Response timeout duration in milliseconds (30 seconds)
 */
export const RESPONSE_TIMEOUT = 30000;

/**
 * CORS methods allowed for API
 */
export const CORS_API_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] as const;

/**
 * CORS headers allowed
 */
export const CORS_ALLOWED_HEADERS = ['Content-Type', 'Authorization'] as const;

/**
 * Body parser JSON size limit
 */
export const BODY_PARSER_LIMIT = '1mb';

/**
 * Cache control header for no-cache responses
 */
export const CACHE_CONTROL_NO_CACHE = 'private, no-cache, no-store, must-revalidate';

/**
 * Cache control header for static assets
 */
export const CACHE_CONTROL_STATIC = '1d';

/**
 * Default localhost hostname
 */
export const DEFAULT_LOCALHOST = 'localhost';

/**
 * Wildcard address for listening on all interfaces
 */
export const WILDCARD_ADDRESS = '0.0.0.0';

/**
 * HTTP protocol prefix
 */
export const HTTP_PROTOCOL = 'http://';

/**
 * CSP directives for Helmet
 */
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],
  imgSrc: ["'self'", 'data:', 'https:'],
} as const;

/**
 * Static file extensions pattern
 */
export const STATIC_FILE_PATTERN = /(.ico|.js|.css|.jpg|.png|.map|.woff|.woff2|.ttf)$/i;

/**
 * Expires header for no-cache responses
 */
export const EXPIRES_HEADER = '-1';

/**
 * Pragma header for no-cache responses
 */
export const PRAGMA_HEADER = 'no-cache';

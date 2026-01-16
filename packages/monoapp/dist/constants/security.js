"use strict";
/**
 * Security Constants
 * Defines security-related configuration and constants
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRAGMA_HEADER = exports.EXPIRES_HEADER = exports.STATIC_FILE_PATTERN = exports.CSP_DIRECTIVES = exports.HTTP_PROTOCOL = exports.WILDCARD_ADDRESS = exports.DEFAULT_LOCALHOST = exports.CACHE_CONTROL_STATIC = exports.CACHE_CONTROL_NO_CACHE = exports.BODY_PARSER_LIMIT = exports.CORS_ALLOWED_HEADERS = exports.CORS_API_METHODS = exports.RESPONSE_TIMEOUT = exports.REQUEST_TIMEOUT = void 0;
/**
 * Request timeout duration in milliseconds (30 seconds)
 */
exports.REQUEST_TIMEOUT = 30000;
/**
 * Response timeout duration in milliseconds (30 seconds)
 */
exports.RESPONSE_TIMEOUT = 30000;
/**
 * CORS methods allowed for API
 */
exports.CORS_API_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
/**
 * CORS headers allowed
 */
exports.CORS_ALLOWED_HEADERS = ['Content-Type', 'Authorization'];
/**
 * Body parser JSON size limit
 */
exports.BODY_PARSER_LIMIT = '1mb';
/**
 * Cache control header for no-cache responses
 */
exports.CACHE_CONTROL_NO_CACHE = 'private, no-cache, no-store, must-revalidate';
/**
 * Cache control header for static assets
 */
exports.CACHE_CONTROL_STATIC = '1d';
/**
 * Default localhost hostname
 */
exports.DEFAULT_LOCALHOST = 'localhost';
/**
 * Wildcard address for listening on all interfaces
 */
exports.WILDCARD_ADDRESS = 'localhost';
/**
 * HTTP protocol prefix
 */
exports.HTTP_PROTOCOL = 'http://';
/**
 * CSP directives for Helmet
 */
exports.CSP_DIRECTIVES = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
};
/**
 * Static file extensions pattern
 */
exports.STATIC_FILE_PATTERN = /(.ico|.js|.css|.jpg|.png|.map|.woff|.woff2|.ttf)$/i;
/**
 * Expires header for no-cache responses
 */
exports.EXPIRES_HEADER = '-1';
/**
 * Pragma header for no-cache responses
 */
exports.PRAGMA_HEADER = 'no-cache';

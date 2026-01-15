"use strict";
/**
 * Port Constants
 * Defines valid port range and port-related configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT_VALIDATION_ERROR_MESSAGE = exports.PORT_MAX = exports.PORT_MIN = void 0;
/**
 * Minimum valid port number (above system reserved ports)
 */
exports.PORT_MIN = 1024;
/**
 * Maximum valid port number
 */
exports.PORT_MAX = 65535;
/**
 * Port validation error message
 */
const PORT_VALIDATION_ERROR_MESSAGE = (min, max) => `Port must be between ${min} and ${max}`;
exports.PORT_VALIDATION_ERROR_MESSAGE = PORT_VALIDATION_ERROR_MESSAGE;

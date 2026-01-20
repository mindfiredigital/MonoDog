/**
 * Port Constants
 * Defines valid port range and port-related configuration
 */

/**
 * Minimum valid port number (above system reserved ports)
 */
export const PORT_MIN = 1024;

/**
 * Maximum valid port number
 */
export const PORT_MAX = 65535;

/**
 * Port validation error message
 */
export const PORT_VALIDATION_ERROR_MESSAGE = (min: number, max: number): string =>
  `Port must be between ${min} and ${max}`;

/**
 * Logger configuration using Morgan
 */

import morgan from 'morgan';

/**
 * HTTP request logger middleware using Morgan
 */
export const httpLogger = morgan('dev');

/**
 * Application logger for non-HTTP events
 */
export class AppLogger {
  private static readonly prefix = '[APP]';

  static info(message: string, data?: Record<string, unknown>): void {
    if (process.env.LOG_LEVEL == 'info' || process.env.LOG_LEVEL == 'debug') {
      if (data) {
        console.log(`${this.prefix} [INFO]`, message, JSON.stringify(data, null, 2));
      } else {
        console.log(`${this.prefix} [INFO]`, message);
      }
    }
  }

  static error(message: string, error?: Error | Record<string, unknown>): void {
    if (error instanceof Error) {
      console.error(`${this.prefix} [ERROR]`, message, {
        message: error.message,
        stack: error.stack,
      });
    } else if (error) {
      console.error(`${this.prefix} [ERROR]`, message, error);
    } else {
      console.error(`${this.prefix} [ERROR]`, message);
    }
  }

  static warn(message: string, data?: Record<string, unknown>): void {
    if (data) {
      console.warn(`${this.prefix} [WARN]`, message, JSON.stringify(data, null, 2));
    } else {
      console.warn(`${this.prefix} [WARN]`, message);
    }
  }

  static debug(message: string, data?: Record<string, unknown>): void {
    if (process.env.LOG_LEVEL == 'debug') {
      if (data) {
        console.log(`${this.prefix} [DEBUG]`, message, JSON.stringify(data, null, 2));
      } else {
        console.log(`${this.prefix} [DEBUG]`, message);
      }
    }
  }
}

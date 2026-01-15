"use strict";
/**
 * Logger configuration using Morgan
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLogger = exports.httpLogger = void 0;
const morgan_1 = __importDefault(require("morgan"));
/**
 * Custom Morgan token to format timestamp
 */
morgan_1.default.token('timestamp', () => {
    return new Date().toISOString();
});
/**
 * Custom Morgan token for colored status code
 */
morgan_1.default.token('status-color', (req, res) => {
    const status = res.statusCode;
    const color = status >= 500 ? '31' : status >= 400 ? '33' : '32'; // red, yellow, green
    return `\u001b[${color}m${status}\u001b[39m`;
});
/**
 * HTTP request logger middleware using Morgan
 * Format: [timestamp] method path status response-time ms
 */
exports.httpLogger = (0, morgan_1.default)('[HTTP] :timestamp :method :url :status-color :response-time ms', {
    skip: (req) => {
        // Skip logging for health check endpoints
        return req.path === '/api/health' && req.method === 'GET';
    },
});
/**
 * Application logger for non-HTTP events
 */
class AppLogger {
    static info(message, data) {
        if (process.env.LOG_LEVEL == 'info') {
            if (data) {
                console.log(`${this.prefix} [INFO]`, message, JSON.stringify(data, null, 2));
            }
            else {
                console.log(`${this.prefix} [INFO]`, message);
            }
        }
    }
    static error(message, error) {
        if (error instanceof Error) {
            console.error(`${this.prefix} [ERROR]`, message, {
                message: error.message,
                stack: error.stack,
            });
        }
        else if (error) {
            console.error(`${this.prefix} [ERROR]`, message, error);
        }
        else {
            console.error(`${this.prefix} [ERROR]`, message);
        }
    }
    static warn(message, data) {
        if (data) {
            console.warn(`${this.prefix} [WARN]`, message, JSON.stringify(data, null, 2));
        }
        else {
            console.warn(`${this.prefix} [WARN]`, message);
        }
    }
    static debug(message, data) {
        if (process.env.LOG_LEVEL == 'debug') {
            if (data) {
                console.log(`${this.prefix} [DEBUG]`, message, JSON.stringify(data, null, 2));
            }
            else {
                console.log(`${this.prefix} [DEBUG]`, message);
            }
        }
    }
}
exports.AppLogger = AppLogger;
AppLogger.prefix = '[APP]';

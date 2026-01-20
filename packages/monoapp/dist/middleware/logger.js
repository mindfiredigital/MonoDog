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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(__dirname, '../../', 'access.log'), { flags: 'a' });
/**
 * HTTP request logger middleware using Morgan, only log error responses
 */
exports.httpLogger = (0, morgan_1.default)('combined', {
    stream: accessLogStream,
    // skip: function (req, res) { return res.statusCode < 400 }
});
/**
 * Application logger for non-HTTP events
 */
class AppLogger {
    static info(message, data) {
        if (process.env.LOG_LEVEL == 'info' || process.env.LOG_LEVEL == 'debug') {
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

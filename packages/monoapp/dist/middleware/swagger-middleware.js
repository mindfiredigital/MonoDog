"use strict";
/**
 * Swagger Documentation Middleware
 * Sets up Swagger UI for API documentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwaggerDocs = setupSwaggerDocs;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const logger_1 = require("./logger");
const swagger_config_1 = require("../config/swagger-config");
/**
 * Setup Swagger documentation endpoint
 * @param app Express application instance
 */
function setupSwaggerDocs(app) {
    try {
        const specs = (0, swagger_jsdoc_1.default)(swagger_config_1.swaggerOptions);
        // Serve raw Swagger JSON FIRST (before the middleware catches all /api-docs paths)
        app.get('/api-docs/swagger.json', (_req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(specs);
        });
        // Serve Swagger UI at /api-docs
        app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
            swaggerOptions: {
                url: '/api-docs/swagger.json',
                persistAuthorization: true,
                displayOperationId: true,
                filter: true,
                showExtensions: true,
            },
            customCss: `
          .swagger-ui .topbar {
            background-color: #2c3e50;
          }
          .swagger-ui .info .title {
            color: #2c3e50;
            font-weight: bold;
          }
          .swagger-ui .btn-box .btn {
            background-color: #2c3e50;
          }
        `,
            customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
        }));
        logger_1.AppLogger.info('Swagger documentation available at /api-docs');
    }
    catch (error) {
        logger_1.AppLogger.error('Failed to setup Swagger documentation', error);
    }
}

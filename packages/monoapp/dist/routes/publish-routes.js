"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const publish_controller_1 = require("../controllers/publish-controller");
const auth_middleware_1 = require("../middleware/auth-middleware");
const publishRouter = express_1.default.Router();
/**
 * GET /api/publish/packages
 * Get all workspace packages for publishing
 * Requires: read permission
 */
publishRouter.get('/packages', auth_middleware_1.authenticationMiddleware, publish_controller_1.getPublishPackages);
/**
 * GET /api/publish/changesets
 * Get existing unpublished changesets
 * Requires: read permission
 */
publishRouter.get('/changesets', auth_middleware_1.authenticationMiddleware, publish_controller_1.getPublishChangesets);
/**
 * POST /api/publish/preview
 * Preview the publish plan (calculate new versions, affected packages)
 * Requires: read permission
 */
publishRouter.post('/preview', auth_middleware_1.authenticationMiddleware, publish_controller_1.previewPublish);
/**
 * POST /api/publish/changesets
 * Create a new changeset for the selected packages
 * Requires: write permission
 */
publishRouter.post('/changesets', auth_middleware_1.authenticationMiddleware, (0, auth_middleware_1.repositoryPermissionMiddleware)('write'), publish_controller_1.createChangeset);
/**
 * GET /api/publish/status
 * Check publish readiness (working tree, changesets, etc.)
 * Requires: read permission
 */
publishRouter.get('/status', auth_middleware_1.authenticationMiddleware, publish_controller_1.checkPublishStatus);
/**
 * POST /api/publish/trigger
 * Trigger the publishing workflow
 * Requires: maintain permission
 */
publishRouter.post('/trigger', auth_middleware_1.authenticationMiddleware, (0, auth_middleware_1.repositoryPermissionMiddleware)('maintain'), publish_controller_1.triggerPublish);
exports.default = publishRouter;

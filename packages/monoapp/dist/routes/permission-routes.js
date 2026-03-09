"use strict";
/**
 * Repository Permission Routes
 * Handles checking and managing repository permissions
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth-middleware");
const permission_controller_1 = require("../controllers/permission-controller");
const router = (0, express_1.Router)();
/**
 * Get user's permission for a specific repository
 * GET /permissions/:owner/:repo
 */
router.get('/:owner/:repo', auth_middleware_1.authenticationMiddleware, permission_controller_1.getRepositoryPermission);
/**
 * Check if user can perform a specific action
 * POST /permissions/:owner/:repo/can-action
 */
router.post('/:owner/:repo/can-action', auth_middleware_1.authenticationMiddleware, permission_controller_1.checkActionPermission);
/**
 * Invalidate permission cache for a repository
 * POST /permissions/:owner/:repo/invalidate
 */
router.post('/:owner/:repo/invalidate', auth_middleware_1.authenticationMiddleware, permission_controller_1.invalidateCache);
exports.default = router;

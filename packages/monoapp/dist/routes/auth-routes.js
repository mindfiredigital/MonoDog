"use strict";
/**
 * Authentication Routes
 * Handles GitHub OAuth and session management
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth-controller");
const auth_middleware_1 = require("../middleware/auth-middleware");
const router = (0, express_1.Router)();
/**
 * Start OAuth login flow
 * GET /auth/login
 */
router.get('/login', auth_controller_1.login);
/**
 * OAuth callback handler
 * GET /auth/callback?code=...&state=...
 */
router.get('/callback', auth_controller_1.callback);
/**
 * Get current user session
 * GET /auth/me
 */
router.get('/me', auth_middleware_1.authenticationMiddleware, auth_controller_1.me);
/**
 * Validate session
 * POST /auth/validate
 */
router.post('/validate', auth_middleware_1.authenticationMiddleware, auth_controller_1.validate);
/**
 * Logout
 * POST /auth/logout
 */
router.post('/logout', auth_middleware_1.authenticationMiddleware, auth_controller_1.logout);
/**
 * Refresh session (token)
 * POST /auth/refresh
 */
router.post('/refresh', auth_middleware_1.authenticationMiddleware, auth_controller_1.refresh);
exports.default = router;

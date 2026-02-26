/**
 * Authentication Routes
 * Handles GitHub OAuth and session management
 */

import express, { Router } from 'express';
import {
  login,
  callback,
  me,
  validate,
  logout,
  refresh,
} from '../controllers/auth-controller';
import { authenticationMiddleware } from '../middleware/auth-middleware';
import { startCacheCleanup } from '../services/permission-service';

const router = Router();

/**
 * Start OAuth login flow
 * GET /auth/login
 */
router.get('/login', login);

/**
 * OAuth callback handler
 * GET /auth/callback?code=...&state=...
 */
router.get('/callback', callback);

/**
 * Get current user session
 * GET /auth/me
 */
router.get('/me', authenticationMiddleware, me);

/**
 * Validate session
 * POST /auth/validate
 */
router.post('/validate', authenticationMiddleware, validate);

/**
 * Logout
 * POST /auth/logout
 */
router.post('/logout', authenticationMiddleware, logout);

/**
 * Refresh session (token)
 * POST /auth/refresh
 */
router.post('/refresh', authenticationMiddleware, refresh);

export default router;

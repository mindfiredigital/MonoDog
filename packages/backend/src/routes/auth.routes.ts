import { Router } from 'express';
import {
  login,
  callback,
  getMe,
  validate,
  logout,
} from '../controllers/auth.controller';

const router = Router();

// Authentication routes
router.get('/login', login);
router.get('/callback', callback);
router.get('/me', getMe);
router.get('/validate', validate);
router.post('/logout', logout);

export default router;

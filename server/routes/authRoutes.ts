import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  adminGoogleAuth,
  refreshToken,
  getMe,
  logout,
  logoutAll,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../controllers/authController';
import { protect, csrfProtection } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/securityMiddleware';

const router = Router();

// Public Authentication Endpoints with Strict Rate Limiting
router.post('/register', authLimiter, csrfProtection, register);
router.post('/login', authLimiter, csrfProtection, login);
router.post('/google', authLimiter, csrfProtection, googleAuth);
router.post('/admin/google', authLimiter, csrfProtection, adminGoogleAuth);
router.post('/refresh', csrfProtection, refreshToken);
router.post('/forgot-password', authLimiter, csrfProtection, forgotPassword);
router.post('/reset-password', authLimiter, csrfProtection, resetPassword);
router.post('/verify-email', csrfProtection, verifyEmail);

// Protected Authentication Endpoints
router.get('/me', protect, getMe);
router.post('/logout', csrfProtection, logout);
router.post('/logout-all', protect, csrfProtection, logoutAll);

export default router;

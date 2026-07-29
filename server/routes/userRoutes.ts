import { Router } from 'express';
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  deleteMyAccount,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  updateProfileSchema,
  changePasswordSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from '../controllers/userController';
import { protect, adminOnly, csrfProtection } from '../middleware/authMiddleware';
import { validateBody, validateParams, idParamSchema } from '../middleware/securityMiddleware';

const router = Router();

// Authenticated User Endpoints
router.get('/me', protect, getMyProfile);

router.put(
  '/profile',
  protect,
  csrfProtection,
  validateBody(updateProfileSchema),
  updateMyProfile
);

router.put(
  '/change-password',
  protect,
  csrfProtection,
  validateBody(changePasswordSchema),
  changePassword
);

router.delete('/me', protect, csrfProtection, deleteMyAccount);

// Admin-Only User Management Endpoints
router.get('/', protect, adminOnly, getUsers);

router.put(
  '/:id/role',
  protect,
  adminOnly,
  csrfProtection,
  validateParams(idParamSchema),
  validateBody(updateUserRoleSchema),
  updateUserRole
);

router.put(
  '/:id/status',
  protect,
  adminOnly,
  csrfProtection,
  validateParams(idParamSchema),
  validateBody(updateUserStatusSchema),
  updateUserStatus
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  csrfProtection,
  validateParams(idParamSchema),
  deleteUser
);

export default router;

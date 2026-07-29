import { Router } from 'express';
import { getSettings, updateSettings, updateSettingsSchema } from '../controllers/settingsController';
import { protect, adminOnly, csrfProtection } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/securityMiddleware';

const router = Router();

// Public Settings Read Endpoint
router.get('/', getSettings);

// Admin-Only Settings Update Endpoint
router.put(
  '/',
  protect,
  adminOnly,
  csrfProtection,
  validateBody(updateSettingsSchema),
  updateSettings
);

export default router;

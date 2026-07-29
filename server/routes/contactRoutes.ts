import { Router } from 'express';
import { submitContact, getMessages, submitContactSchema } from '../controllers/contactController';
import { protect, adminOnly, csrfProtection } from '../middleware/authMiddleware';
import { validateBody, contactLimiter } from '../middleware/securityMiddleware';

const router = Router();

// Public Contact Endpoint (Rate Limited to 10 submissions per 15 min window)
router.post(
  '/',
  contactLimiter,
  csrfProtection,
  validateBody(submitContactSchema),
  submitContact
);

// Admin-Only Contact Messages Endpoint
router.get('/', protect, adminOnly, getMessages);

export default router;

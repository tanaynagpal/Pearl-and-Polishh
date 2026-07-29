import { Router } from 'express';
import {
  createAppointment,
  getMyAppointments,
  getAppointmentById,
  cancelMyAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from '../controllers/appointmentController';
import { protect, adminOnly, csrfProtection } from '../middleware/authMiddleware';
import { validateBody, validateParams, idParamSchema } from '../middleware/securityMiddleware';

const router = Router();

// Public / Protected Appointment Endpoints
router.post(
  '/',
  csrfProtection,
  validateBody(createAppointmentSchema),
  createAppointment
);

router.get('/my', protect, getMyAppointments);

router.get(
  '/:id',
  protect,
  validateParams(idParamSchema),
  getAppointmentById
);

router.post(
  '/:id/cancel',
  protect,
  csrfProtection,
  validateParams(idParamSchema),
  cancelMyAppointment
);

// Admin-Only Appointment Endpoints
router.get('/', protect, adminOnly, getAllAppointments);

router.put(
  '/:id/status',
  protect,
  adminOnly,
  csrfProtection,
  validateParams(idParamSchema),
  validateBody(updateAppointmentStatusSchema),
  updateAppointmentStatus
);

export default router;

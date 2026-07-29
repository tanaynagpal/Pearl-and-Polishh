import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
  createOrderSchema,
  updateOrderStatusSchema,
} from '../controllers/orderController';
import { protect, adminOnly, csrfProtection } from '../middleware/authMiddleware';
import { validateBody, validateParams, idParamSchema } from '../middleware/securityMiddleware';

const router = Router();

// Protected User Order Endpoints
router.post(
  '/',
  protect,
  csrfProtection,
  validateBody(createOrderSchema),
  createOrder
);

router.get('/my', protect, getMyOrders);

router.get(
  '/:id',
  protect,
  validateParams(idParamSchema),
  getOrderById
);

router.post(
  '/:id/cancel',
  protect,
  csrfProtection,
  validateParams(idParamSchema),
  cancelMyOrder
);

// Admin-Only Order Endpoints
router.get('/', protect, adminOnly, getAllOrders);

router.put(
  '/:id/status',
  protect,
  adminOnly,
  csrfProtection,
  validateParams(idParamSchema),
  validateBody(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;

import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductSchema,
  updateProductSchema,
} from '../controllers/productController';
import { protect, adminOnly, csrfProtection } from '../middleware/authMiddleware';
import { validateBody, validateParams, idParamSchema, searchLimiter } from '../middleware/securityMiddleware';

const router = Router();

// Public Product Endpoints
router.get('/', searchLimiter, getProducts);
router.get('/:id', validateParams(idParamSchema), searchLimiter, getProductById);

// Admin-Only Product Endpoints
router.post(
  '/',
  protect,
  adminOnly,
  csrfProtection,
  validateBody(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  protect,
  adminOnly,
  csrfProtection,
  validateParams(idParamSchema),
  validateBody(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  csrfProtection,
  validateParams(idParamSchema),
  deleteProduct
);

export default router;

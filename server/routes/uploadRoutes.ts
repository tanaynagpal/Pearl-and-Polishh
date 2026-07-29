import { Router } from 'express';
import { handleImageUpload, multerUpload } from '../controllers/uploadController';
import { protect, csrfProtection } from '../middleware/authMiddleware';

const router = Router();

// Upload Image Endpoint (Protected, CSRF validated, Rate limited via Multer)
router.post(
  '/',
  protect,
  csrfProtection,
  multerUpload.single('image'),
  handleImageUpload
);

export default router;

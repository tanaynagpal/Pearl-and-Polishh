import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../middleware/authMiddleware';
import { uploadBufferToCloudinary } from '../services/cloudinary';
import { logSecurityAudit } from '../middleware/securityMiddleware';

// Multer memory storage setup
const storage = multer.memoryStorage();

// Allowed image MIME types (Strictly NO SVG or executable scripts)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

// Multer middleware configured for max 5MB image size
export const multerUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 Megabytes
    files: 1, // Single file per request
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
      return cb(
        new Error(
          'Security Error: Invalid file format. Only JPEG, PNG, WebP, and AVIF images are permitted.'
        )
      );
    }
    cb(null, true);
  },
});

/**
 * Handle Single Image Upload
 */
export const handleImageUpload = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select an image file to upload.',
      });
    }

    const folder = req.body.folder || 'pearl_and_polish/products';

    const result = await uploadBufferToCloudinary(req.file.buffer, folder);

    logSecurityAudit(
      'IMAGE_UPLOAD_SUCCESS',
      req,
      `Public ID: ${result.publicId} | Format: ${result.format} | Bytes: ${result.bytes}`
    );

    return res.status(200).json({
      success: true,
      message: 'Image uploaded and optimized successfully.',
      data: {
        url: result.secureUrl,
        publicId: result.publicId,
        format: result.format,
        bytes: result.bytes,
        responsive: result.responsiveUrls,
      },
    });
  } catch (error: any) {
    logSecurityAudit('IMAGE_UPLOAD_ERROR', req, error.message);
    return res.status(400).json({
      success: false,
      message: error.message || 'Image upload failed.',
      errors: [error.message],
    });
  }
};

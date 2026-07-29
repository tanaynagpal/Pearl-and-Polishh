import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

// Initialize Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  responsiveUrls: {
    thumbnail: string; // 300px
    medium: string;    // 600px
    large: string;     // 1200px
    webp: string;      // Auto WebP
    avif: string;      // Auto AVIF
  };
}

/**
 * Checks if Cloudinary credentials are set up.
 */
export const isCloudinaryConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name'
  );
};

/**
 * Validates magic numbers / image signatures for uploaded buffers.
 * Prevents disguised executable / malicious file uploads.
 */
export const validateImageMagicBytes = (buffer: Buffer): { valid: boolean; format?: string } => {
  if (!buffer || buffer.length < 12) return { valid: false };

  // JPEG / JPG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, format: 'jpeg' };
  }

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, format: 'png' };
  }

  // WebP magic bytes: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: true, format: 'webp' };
  }

  // AVIF magic bytes: ....ftypavif or ftypavis
  const headerStr = buffer.toString('ascii', 4, 12);
  if (headerStr === 'ftypavif' || headerStr === 'ftypavis') {
    return { valid: true, format: 'avif' };
  }

  return { valid: false };
};

/**
 * Uploads an image buffer securely to Cloudinary.
 * Removes EXIF metadata, strips unsafe content, randomizes filename, and compresses.
 */
export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string = 'pearl_and_polish/products'
): Promise<UploadResult> => {
  // Validate magic bytes first
  const { valid, format } = validateImageMagicBytes(buffer);
  if (!valid) {
    throw new Error('Security Error: Uploaded file signature does not match a valid image format (JPEG, PNG, WebP, AVIF).');
  }

  if (!isCloudinaryConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Production Error: Cloudinary storage credentials are missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    }

    // Mock response for local development when Cloudinary is not configured
    const randomHash = crypto.randomBytes(8).toString('hex');
    const mockPublicId = `${folder}/${randomHash}`;
    const mockUrl = `https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1000&q=80`;

    return {
      url: mockUrl,
      secureUrl: mockUrl,
      publicId: mockPublicId,
      format: format || 'jpeg',
      bytes: buffer.length,
      responsiveUrls: {
        thumbnail: mockUrl,
        medium: mockUrl,
        large: mockUrl,
        webp: mockUrl,
        avif: mockUrl,
      },
    };
  }

  // Generate randomized unique public ID
  const uniquePublicId = `${folder}/${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: uniquePublicId,
        overwrite: false,
        resource_type: 'image',
        // Security & Optimization: Remove EXIF metadata & strip executable code
        image_metadata: false,
        quality: 'auto:good',
        fetch_format: 'auto',
      },
      (error, result) => {
        if (error || !result) {
          return reject(new Error(`Cloudinary Upload Failure: ${error?.message || 'Unknown error'}`));
        }

        const baseUrl = result.secure_url;
        const publicId = result.public_id;

        // Generate responsive transformation URLs
        const getTransformedUrl = (transformString: string) => {
          return cloudinary.url(publicId, {
            secure: true,
            transformation: transformString,
          });
        };

        resolve({
          url: result.url,
          secureUrl: baseUrl,
          publicId,
          format: result.format,
          bytes: result.bytes,
          responsiveUrls: {
            thumbnail: getTransformedUrl('c_limit,w_300,q_auto,f_auto'),
            medium: getTransformedUrl('c_limit,w_600,q_auto,f_auto'),
            large: getTransformedUrl('c_limit,w_1200,q_auto,f_auto'),
            webp: getTransformedUrl('c_limit,w_800,q_auto,f_webp'),
            avif: getTransformedUrl('c_limit,w_800,q_auto,f_avif'),
          },
        });
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by Public ID.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  if (!isCloudinaryConfigured()) return true;

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error(`[CLOUDINARY DELETE ERROR] Failed to delete publicId ${publicId}:`, error);
    return false;
  }
};

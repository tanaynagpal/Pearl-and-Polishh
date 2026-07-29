/**
 * Generates Cloudinary transformation URL for responsive images.
 * If the URL is not a Cloudinary URL, it returns the original URL.
 */
export const getOptimizedImageUrl = (
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco';
    format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
    crop?: 'fill' | 'fit' | 'limit' | 'thumb';
  } = {}
): string => {
  if (!url) return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80';

  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width = 800,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options;

  const transformations = [
    `c_${crop}`,
    `w_${width}`,
    height ? `h_${height}` : null,
    `q_${quality}`,
    `f_${format}`,
  ]
    .filter(Boolean)
    .join(',');

  return url.replace('/upload/', `/upload/${transformations}/`);
};

/**
 * Returns srcset string for Cloudinary responsive images
 */
export const getImageSrcSet = (url: string): string => {
  if (!url || !url.includes('cloudinary.com')) return '';

  const widths = [300, 600, 900, 1200];
  return widths
    .map((w) => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
};

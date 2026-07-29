import { Request, Response } from 'express';
import { z } from 'zod';
import { Store } from '../services/store';
import { AuthRequest } from '../middleware/authMiddleware';
import { logSecurityAudit } from '../middleware/securityMiddleware';

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const createProductSchema = z
  .object({
    title: z.string().trim().min(2, 'Product title must be at least 2 characters.').max(100, 'Product title too long.'),
    price: z.number().positive('Product price must be greater than 0.'),
    description: z.string().trim().min(5, 'Product description must be at least 5 characters.').max(2000, 'Description too long.'),
    shape: z.string().trim().min(1, 'Shape is required.').default('Medium Almond'),
    length: z.string().trim().min(1, 'Length is required.').default('Medium'),
    size: z.string().trim().min(1, 'Size is required.').default('Custom'),
    images: z.array(z.string().url('Product image must be a valid URL.')).min(1, 'At least one product image URL is required.'),
    tag: z.string().trim().optional().default(''),
    category: z.string().trim().min(1, 'Category is required.').default('Luxury Press-On'),
    featured: z.boolean().optional().default(false),
    hidden: z.boolean().optional().default(false),
    instagramLink: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || val.startsWith('http://') || val.startsWith('https://'), {
        message: 'Instagram link must be a valid HTTP or HTTPS URL.',
      })
      .default(''),
  })
  .strict();

export const updateProductSchema = createProductSchema.partial().strict();

// ============================================================================
// CONTROLLER HANDLERS
// ============================================================================

/**
 * Get Products
 * Public users get only visible (hidden: false) products.
 * Admins can retrieve all products including hidden ones.
 */
export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const products = await Store.getAllProducts({
      includeHidden: isAdmin,
      category,
      search,
    });

    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully.',
      count: products.length,
      data: products,
      products, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('PRODUCT_FETCH_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products.',
      errors: [error.message],
    });
  }
};

/**
 * Get Single Product by ID
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await Store.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    // Hide hidden products from non-admins
    const authReq = req as AuthRequest;
    if (product.hidden && authReq.user?.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product details retrieved successfully.',
      data: product,
      product, // Frontend compatibility alias
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve product details.',
      errors: [error.message],
    });
  }
};

/**
 * Create Product (Admin Only)
 */
export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createProductSchema.parse(req.body);

    const product = await Store.createProduct({
      ...validatedData,
      createdBy: req.user?.id,
    });

    logSecurityAudit('PRODUCT_CREATED', req, `Created Product ID: ${product.id || product._id} - ${product.title}`);

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
      product, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('PRODUCT_CREATE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create product.',
      errors: [error.message],
    });
  }
};

/**
 * Update Product (Admin Only)
 */
export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);

    const existingProduct = await Store.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const updated = await Store.updateProduct(id, {
      ...validatedData,
      updatedBy: req.user?.id,
    });

    logSecurityAudit('PRODUCT_UPDATED', req, `Updated Product ID: ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      data: updated,
      product: updated, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('PRODUCT_UPDATE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product.',
      errors: [error.message],
    });
  }
};

/**
 * Delete Product (Admin Only)
 */
export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const existingProduct = await Store.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    await Store.deleteProduct(id);

    logSecurityAudit('PRODUCT_DELETED', req, `Deleted Product ID: ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error: any) {
    logSecurityAudit('PRODUCT_DELETE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete product.',
      errors: [error.message],
    });
  }
};

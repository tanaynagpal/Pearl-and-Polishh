import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';
import { Store } from '../services/store';
import { logSecurityAudit } from '../middleware/securityMiddleware';

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const orderItemSchema = z
  .object({
    productId: z.string().trim().min(1, 'Product ID is required.'),
    title: z.string().trim().min(1, 'Product title is required.'),
    price: z.number().positive('Item price must be a positive number.'),
    quantity: z.number().int('Quantity must be an integer.').min(1, 'Quantity must be at least 1.'),
    shape: z.string().trim().optional(),
    length: z.string().trim().optional(),
    size: z.string().trim().optional(),
    image: z.string().url('Image must be a valid URL.').optional().or(z.literal('')),
  })
  .strict();

export const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1, 'Order must contain at least one item.'),
    total: z.number().positive('Order total must be greater than 0.'),
    customSizes: z.string().trim().optional().default(''),
    shippingAddress: z.string().trim().min(5, 'Shipping address must be at least 5 characters long.'),
    notes: z.string().trim().optional().default(''),
    phone: z.string().trim().min(5, 'A valid contact phone number is required.'),
  })
  .strict();

export const updateOrderStatusSchema = z
  .object({
    status: z.enum(['pending', 'processing', 'completed', 'shipped', 'delivered', 'cancelled'], {
      message: 'Invalid order status.',
    }),
  })
  .strict();

// ============================================================================
// CONTROLLER HANDLERS
// ============================================================================

/**
 * Create Order
 * Strictly binds user ID, email, name from req.user to prevent impersonation.
 */
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      logSecurityAudit('ORDER_CREATE_UNAUTHORIZED', req, 'Attempted order creation without auth token');
      return res.status(401).json({ success: false, message: 'Authentication required to place an order.' });
    }

    const { items, total, customSizes, shippingAddress, notes, phone } = req.body;

    // Server-Side Total Verification
    const calculatedTotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    if (Math.abs(calculatedTotal - total) > 0.01) {
      logSecurityAudit(
        'ORDER_TOTAL_MISMATCH',
        req,
        `Submitted total ${total} does not match computed total ${calculatedTotal}`
      );
      return res.status(400).json({
        success: false,
        message: 'Order total mismatch detected. Please review cart contents.',
      });
    }

    const orderNumber = 'PP-ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);

    const order = await Store.createOrder({
      orderNumber,
      userId: req.user.id,
      userEmail: req.user.email.trim().toLowerCase(),
      userName: req.user.name,
      userPhone: phone,
      items,
      total: calculatedTotal,
      status: 'pending',
      customSizes,
      shippingAddress,
      notes,
    });

    logSecurityAudit('ORDER_CREATED', req, `Order Number: ${orderNumber} | Total: ${calculatedTotal}`);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: order,
      order, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('ORDER_CREATE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to place order.',
      errors: [error.message],
    });
  }
};

/**
 * Get My Orders (Client Views ONLY Their Own Orders)
 */
export const getMyOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const orders = await Store.getOrdersByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'User orders retrieved successfully.',
      count: orders.length,
      data: orders,
      orders, // Frontend compatibility alias
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders.',
      errors: [error.message],
    });
  }
};

/**
 * Get Order Details By ID (Strict Authorization: Owner or Admin)
 */
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const order = await Store.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Authorization Guard: Client can ONLY view their own order
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      logSecurityAudit('UNAUTHORIZED_ORDER_ACCESS_ATTEMPT', req, `Tried accessing Order ID: ${id}`);
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to view this order.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order details retrieved successfully.',
      data: order,
      order, // Frontend compatibility alias
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order details.',
      errors: [error.message],
    });
  }
};

/**
 * Cancel Order (Client cancels own pending order)
 */
export const cancelMyOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const order = await Store.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      logSecurityAudit('UNAUTHORIZED_ORDER_CANCEL_ATTEMPT', req, `Tried canceling Order ID: ${id}`);
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to cancel this order.',
      });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already '${order.status}'.`,
      });
    }

    const updated = await Store.updateOrderStatus(id, 'cancelled');

    logSecurityAudit('ORDER_CANCELLED', req, `Cancelled Order ID: ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.',
      data: updated,
      order: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order.',
      errors: [error.message],
    });
  }
};

/**
 * Get All Orders (Admin Only)
 */
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;

    const orders = await Store.getAllOrders({ status, search });

    return res.status(200).json({
      success: true,
      message: 'All orders retrieved successfully.',
      count: orders.length,
      data: orders,
      orders, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('GET_ALL_ORDERS_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch all orders.',
      errors: [error.message],
    });
  }
};

/**
 * Update Order Status (Admin Only)
 */
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Store.getOrderById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updated = await Store.updateOrderStatus(id, status);

    logSecurityAudit('ORDER_STATUS_UPDATED', req, `Order ID: ${id} set to ${status}`);

    return res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'.`,
      data: updated,
      order: updated, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('ORDER_STATUS_UPDATE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status.',
      errors: [error.message],
    });
  }
};

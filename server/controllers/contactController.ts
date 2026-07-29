import { Request, Response } from 'express';
import { z } from 'zod';
import { Store } from '../services/store';
import { logSecurityAudit, sanitizeHtml } from '../middleware/securityMiddleware';

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const submitContactSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(100, 'Name is too long.'),
    email: z.string().trim().toLowerCase().email('Please provide a valid email address.'),
    phone: z.string().trim().optional().default(''),
    message: z.string().trim().min(5, 'Message must be at least 5 characters long.').max(2000, 'Message is too long.'),
  })
  .strict();

// ============================================================================
// CONTROLLER HANDLERS
// ============================================================================

/**
 * Submit Contact Form
 * Sanitizes input text to eliminate XSS / HTML injection threats. Rate limited.
 */
export const submitContact = async (req: Request, res: Response) => {
  try {
    const validated = submitContactSchema.parse(req.body);

    const sanitizedName = sanitizeHtml(validated.name);
    const sanitizedMessage = sanitizeHtml(validated.message);
    const sanitizedPhone = sanitizeHtml(validated.phone);

    const newMessage = await Store.createContactMessage({
      name: sanitizedName,
      email: validated.email,
      phone: sanitizedPhone,
      message: sanitizedMessage,
    });

    logSecurityAudit('CONTACT_MESSAGE_SUBMITTED', req, `From: ${validated.email}`);

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully to studio concierge!',
      data: newMessage,
      contactMessage: newMessage, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('CONTACT_SUBMIT_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to send contact message.',
      errors: [error.message],
    });
  }
};

/**
 * Get All Contact Messages (Admin Only)
 */
export const getMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Store.getAllContactMessages();

    return res.status(200).json({
      success: true,
      message: 'Contact messages retrieved successfully.',
      count: messages.length,
      data: messages,
      messages, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('GET_CONTACT_MESSAGES_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages.',
      errors: [error.message],
    });
  }
};

import { Request, Response } from 'express';
import { z } from 'zod';
import { Store } from '../services/store';
import { AuthRequest } from '../middleware/authMiddleware';
import { logSecurityAudit } from '../middleware/securityMiddleware';

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const updateSettingsSchema = z
  .object({
    studioName: z.string().trim().min(2, 'Studio name must be at least 2 characters.').optional(),
    tagline: z.string().trim().optional(),
    address: z.string().trim().optional(),
    phoneWhatsApp: z.string().trim().optional(),
    instagram: z.string().trim().optional(),
    email: z.string().trim().toLowerCase().email('Invalid studio contact email.').optional(),
    openingHoursWeekdays: z.string().trim().optional(),
    openingHoursSaturday: z.string().trim().optional(),
    openingHoursSunday: z.string().trim().optional(),
  })
  .strict();

// ============================================================================
// CONTROLLER HANDLERS
// ============================================================================

/**
 * Get Studio Public Settings
 */
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Store.getSettings();

    return res.status(200).json({
      success: true,
      message: 'Studio settings retrieved successfully.',
      data: settings,
      settings, // Frontend compatibility alias
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch studio settings.',
      errors: [error.message],
    });
  }
};

/**
 * Update Studio Settings (Admin Only)
 */
export const updateSettings = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = updateSettingsSchema.parse(req.body);

    const updated = await Store.updateSettings(validatedData);

    logSecurityAudit('SETTINGS_UPDATED', req, 'Admin updated studio settings');

    return res.status(200).json({
      success: true,
      message: 'Studio settings updated successfully.',
      data: updated,
      settings: updated, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('SETTINGS_UPDATE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update studio settings.',
      errors: [error.message],
    });
  }
};

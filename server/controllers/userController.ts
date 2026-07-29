import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';
import { Store } from '../services/store';
import { logSecurityAudit, sanitizeHtml } from '../middleware/securityMiddleware';

// Password policy rules
const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.');

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long.').max(100).optional(),
    phone: z.string().trim().optional(),
    avatar: z
      .string()
      .trim()
      .optional()
      .refine((val) => !val || val.startsWith('http://') || val.startsWith('https://'), {
        message: 'Avatar must be a valid HTTP or HTTPS URL.',
      }),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: passwordRules,
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New password and confirmation password do not match.',
    path: ['confirmPassword'],
  })
  .strict();

export const updateUserRoleSchema = z
  .object({
    role: z.enum(['client', 'admin'], { message: 'Role must be either client or admin.' }),
  })
  .strict();

export const updateUserStatusSchema = z
  .object({
    isDeleted: z.boolean().optional(),
    isVerified: z.boolean().optional(),
  })
  .strict();

// ============================================================================
// CLIENT HANDLERS (Users managing their own accounts)
// ============================================================================

/**
 * Get Own Profile
 */
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const user = await Store.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully.',
      data: {
        id: user.id || user._id,
        name: user.name,
        email: user.email.trim().toLowerCase(),
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        isVerified: user.isVerified !== false,
        createdAt: user.createdAt,
      },
      user, // Frontend compatibility alias
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile.',
      errors: [error.message],
    });
  }
};

/**
 * Update Own Profile (Name, Phone, Avatar)
 * CANNOT modify role, email, or verification status.
 */
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const validated = updateProfileSchema.parse(req.body);

    const updateFields: any = {};
    if (validated.name) updateFields.name = sanitizeHtml(validated.name);
    if (validated.phone !== undefined) updateFields.phone = sanitizeHtml(validated.phone);
    if (validated.avatar !== undefined) updateFields.avatar = validated.avatar;

    const updatedUser = await Store.updateUser(req.user.id, updateFields);

    logSecurityAudit('USER_PROFILE_UPDATED', req, `User updated profile details`);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: updatedUser.id || updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone || '',
        avatar: updatedUser.avatar || '',
        isVerified: updatedUser.isVerified,
      },
      user: updatedUser,
    });
  } catch (error: any) {
    logSecurityAudit('USER_PROFILE_UPDATE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      errors: [error.message],
    });
  }
};

/**
 * Change Own Password
 * Verifies current password before updating and revokes all active refresh tokens.
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await Store.findUserById(req.user.id);
    if (!user || !user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: 'Unable to change password for social or external login accounts.',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      logSecurityAudit('CHANGE_PASSWORD_INVALID_CURRENT', req, 'Provided incorrect current password');
      return res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect.',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password and invalidate all active sessions
    await Store.updateUser(req.user.id, {
      passwordHash: newPasswordHash,
      refreshTokens: [],
    });

    logSecurityAudit('CHANGE_PASSWORD_SUCCESS', req, 'Password changed successfully');

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again with your new credentials.',
    });
  } catch (error: any) {
    logSecurityAudit('CHANGE_PASSWORD_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password.',
      errors: [error.message],
    });
  }
};

/**
 * Delete Own Account (Soft Delete)
 */
export const deleteMyAccount = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    await Store.deleteUser(req.user.id);

    logSecurityAudit('USER_ACCOUNT_SELF_DELETED', req, `User ID: ${req.user.id} deleted own account`);

    return res.status(200).json({
      success: true,
      message: 'Your account has been deleted successfully.',
    });
  } catch (error: any) {
    logSecurityAudit('USER_ACCOUNT_DELETE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete account.',
      errors: [error.message],
    });
  }
};

// ============================================================================
// ADMIN HANDLERS (Admin managing user platform accounts)
// ============================================================================

/**
 * Get All Users (Admin Only)
 */
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await Store.getAllUsers();

    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully.',
      count: users.length,
      data: users,
      users, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('GET_USERS_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch registered users.',
      errors: [error.message],
    });
  }
};

/**
 * Update User Role (Admin Only)
 */
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = updateUserRoleSchema.parse(req.body);

    const targetUser = await Store.findUserById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updated = await Store.updateUser(id, { role });

    logSecurityAudit('USER_ROLE_CHANGED', req, `Admin changed user ID ${id} role to ${role}`);

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}'.`,
      data: updated,
      user: updated,
    });
  } catch (error: any) {
    logSecurityAudit('USER_ROLE_CHANGE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
      errors: [error.message],
    });
  }
};

/**
 * Update User Status / Suspend (Admin Only)
 */
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validated = updateUserStatusSchema.parse(req.body);

    const targetUser = await Store.findUserById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const updated = await Store.updateUser(id, validated);

    logSecurityAudit('USER_STATUS_CHANGED', req, `Admin updated user ID ${id} status`);

    return res.status(200).json({
      success: true,
      message: 'User status updated successfully.',
      data: updated,
      user: updated,
    });
  } catch (error: any) {
    logSecurityAudit('USER_STATUS_CHANGE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user status.',
      errors: [error.message],
    });
  }
};

/**
 * Delete User (Admin Only)
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const targetUser = await Store.findUserById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await Store.deleteUser(id);

    logSecurityAudit('USER_DELETED_BY_ADMIN', req, `Admin deleted user ID ${id}`);

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error: any) {
    logSecurityAudit('USER_DELETE_BY_ADMIN_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
      errors: [error.message],
    });
  }
};

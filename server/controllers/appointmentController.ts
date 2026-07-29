import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/authMiddleware';
import { Store } from '../services/store';
import { logSecurityAudit } from '../middleware/securityMiddleware';

// Allowed Studio Time Slots
export const ALLOWED_TIME_SLOTS = [
  '10:00 AM',
  '11:30 AM',
  '01:00 PM',
  '02:30 PM',
  '04:00 PM',
  '05:30 PM',
  '07:00 PM',
];

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const createAppointmentSchema = z
  .object({
    clientName: z.string().trim().min(2, 'Client name must be at least 2 characters.').max(100, 'Name is too long.'),
    clientEmail: z.string().trim().toLowerCase().email('Please provide a valid email address.'),
    clientPhone: z.string().trim().min(5, 'A valid contact phone number is required.'),
    serviceName: z.string().trim().min(2, 'Service name is required.'),
    date: z
      .string()
      .trim()
      .refine(
        (val) => {
          const appointmentDate = new Date(val);
          if (isNaN(appointmentDate.getTime())) return false;
          // Set to start of today in local time
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate >= today;
        },
        { message: 'Appointment date cannot be in the past.' }
      ),
    timeSlot: z.string().trim().min(2, 'Time slot is required.'),
    notes: z.string().trim().optional().default(''),
  })
  .strict();

export const updateAppointmentStatusSchema = z
  .object({
    status: z.enum(['pending', 'approved', 'rejected', 'rescheduled', 'completed', 'cancelled'], {
      message: 'Invalid appointment status value.',
    }),
  })
  .strict();

// ============================================================================
// CONTROLLER HANDLERS
// ============================================================================

/**
 * Schedule Appointment
 * Enforces slot collision check, past date guard, and Zod input validation.
 */
export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    const validated = createAppointmentSchema.parse(req.body);
    const { clientName, clientEmail, clientPhone, serviceName, date, timeSlot, notes } = validated;

    const appointmentNumber = 'PP-APT-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
    const userId = req.user ? req.user.id : 'guest-' + Date.now();

    const appointment = await Store.createAppointment({
      appointmentNumber,
      userId,
      clientName: req.user ? req.user.name : clientName,
      clientEmail: req.user ? req.user.email : clientEmail,
      clientPhone,
      serviceName,
      date,
      timeSlot,
      notes,
      status: 'pending',
    });

    logSecurityAudit(
      'APPOINTMENT_SCHEDULED',
      req,
      `Apt #: ${appointmentNumber} | Date: ${date} | Slot: ${timeSlot} | Service: ${serviceName}`
    );

    return res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully.',
      data: appointment,
      appointment, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('APPOINTMENT_CREATE_ERROR', req, error.message);
    const statusCode = error.message?.includes('already booked') ? 409 : 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to schedule appointment.',
      errors: [error.message],
    });
  }
};

/**
 * Get My Appointments (Client Views ONLY Their Own Appointments)
 */
export const getMyAppointments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const appointments = await Store.getAppointmentsByUserId(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'User appointments retrieved successfully.',
      count: appointments.length,
      data: appointments,
      appointments, // Frontend compatibility alias
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user appointments.',
      errors: [error.message],
    });
  }
};

/**
 * Get Appointment Details By ID (Strict Authorization: Owner or Admin)
 */
export const getAppointmentById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const appointment = await Store.getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Authorization Guard
    if (req.user.role !== 'admin' && appointment.userId !== req.user.id) {
      logSecurityAudit('UNAUTHORIZED_APPOINTMENT_ACCESS_ATTEMPT', req, `Tried accessing Apt ID: ${id}`);
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to view this appointment.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Appointment details retrieved successfully.',
      data: appointment,
      appointment, // Frontend compatibility alias
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment details.',
      errors: [error.message],
    });
  }
};

/**
 * Cancel Appointment (Client cancels own appointment)
 */
export const cancelMyAppointment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const { id } = req.params;
    const appointment = await Store.getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (req.user.role !== 'admin' && appointment.userId !== req.user.id) {
      logSecurityAudit('UNAUTHORIZED_APPOINTMENT_CANCEL_ATTEMPT', req, `Tried canceling Apt ID: ${id}`);
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to cancel this appointment.',
      });
    }

    const updated = await Store.updateAppointmentStatus(id, 'rejected');

    logSecurityAudit('APPOINTMENT_CANCELLED', req, `Cancelled Apt ID: ${id}`);

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully.',
      data: updated,
      appointment: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment.',
      errors: [error.message],
    });
  }
};

/**
 * Get All Appointments (Admin Only)
 */
export const getAllAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;

    const appointments = await Store.getAllAppointments({ status, date });

    return res.status(200).json({
      success: true,
      message: 'All appointments retrieved successfully.',
      count: appointments.length,
      data: appointments,
      appointments, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('GET_ALL_APPOINTMENTS_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch all appointments.',
      errors: [error.message],
    });
  }
};

/**
 * Update Appointment Status (Admin Only)
 */
export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Store.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    const updated = await Store.updateAppointmentStatus(id, status);

    logSecurityAudit('APPOINTMENT_STATUS_UPDATED', req, `Apt ID: ${id} set to ${status}`);

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to '${status}'.`,
      data: updated,
      appointment: updated, // Frontend compatibility alias
    });
  } catch (error: any) {
    logSecurityAudit('APPOINTMENT_STATUS_UPDATE_ERROR', req, error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to update appointment status.',
      errors: [error.message],
    });
  }
};

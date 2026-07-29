import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  appointmentNumber: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'rescheduled' | 'completed';
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    appointmentNumber: {
      type: String,
      required: [true, 'Appointment number is required.'],
      unique: true,
      trim: true,
      index: true,
    },
    userId: { type: String, required: [true, 'User ID is required.'], index: true },
    clientName: { type: String, required: [true, 'Client name is required.'], trim: true },
    clientEmail: {
      type: String,
      required: [true, 'Client email is required.'],
      lowercase: true,
      trim: true,
      index: true,
    },
    clientPhone: { type: String, required: [true, 'Client phone is required.'], trim: true },
    serviceName: { type: String, required: [true, 'Service name is required.'], trim: true },
    date: { type: String, required: [true, 'Appointment date is required.'], trim: true, index: true },
    timeSlot: { type: String, required: [true, 'Time slot is required.'], trim: true, index: true },
    notes: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'rescheduled', 'completed'],
        message: 'Invalid appointment status value.',
      },
      default: 'pending',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

// Indexes
AppointmentSchema.index({ createdAt: -1 });
AppointmentSchema.index({ date: 1, timeSlot: 1 }); // Prevents double-booking conflicts
AppointmentSchema.index({ isDeleted: 1, userId: 1, createdAt: -1 });
AppointmentSchema.index({ isDeleted: 1, status: 1 });
AppointmentSchema.index({ appointmentNumber: 'text', clientName: 'text', clientEmail: 'text' });

export const AppointmentModel =
  mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);


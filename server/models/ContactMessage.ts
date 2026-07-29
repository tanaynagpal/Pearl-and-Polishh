import mongoose, { Schema, Document } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: [true, 'Name is required.'], trim: true },
    email: { type: String, required: [true, 'Email is required.'], lowercase: true, trim: true, index: true },
    phone: { type: String, default: '', trim: true },
    message: { type: String, required: [true, 'Message body is required.'], trim: true },
    status: {
      type: String,
      enum: {
        values: ['unread', 'read', 'replied'],
        message: 'Invalid message status.',
      },
      default: 'unread',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ isDeleted: 1, status: 1 });

export const ContactMessageModel =
  mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);


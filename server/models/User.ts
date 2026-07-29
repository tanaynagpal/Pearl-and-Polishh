import mongoose, { Schema, Document } from 'mongoose';

export interface IRefreshToken {
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  userAgent?: string;
  ip?: string;
}

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'client' | 'admin';
  phone?: string;
  googleId?: string;
  avatar?: string;
  isVerified?: boolean;
  lastLoginAt?: Date;
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;
  resetPasswordTokenHash?: string;
  resetPasswordExpires?: Date;
  refreshTokens?: IRefreshToken[];
  failedLoginAttempts?: number;
  lockUntil?: Date;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long.'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
      index: true,
    },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: {
        values: ['client', 'admin'],
        message: 'Role must be either client or admin.',
      },
      default: 'client',
      index: true,
    },
    phone: { type: String, default: '', trim: true },
    googleId: { type: String, sparse: true, index: true },
    avatar: {
      type: String,
      default: '',
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return !v.startsWith('data:image/'); // Prevent base64 image data string storage
        },
        message: 'Base64 image strings are not allowed in database. Store Cloudinary URL instead.',
      },
    },
    isVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    emailVerificationTokenHash: { type: String },
    emailVerificationExpires: { type: Date },
    resetPasswordTokenHash: { type: String },
    resetPasswordExpires: { type: Date },
    refreshTokens: [
      {
        tokenHash: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
        userAgent: { type: String },
        ip: { type: String },
      },
    ],
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ createdAt: -1 });
UserSchema.index({ updatedAt: -1 });
UserSchema.index({ isDeleted: 1, email: 1 });
UserSchema.index({ isDeleted: 1, role: 1 });
UserSchema.index({ name: 'text', email: 'text' });

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


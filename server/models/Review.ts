import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  author: string;
  email?: string;
  rating: number;
  comment: string;
  verified: boolean;
  avatar?: string;
  date: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    author: { type: String, required: [true, 'Review author is required.'], trim: true },
    email: { type: String, default: '', lowercase: true, trim: true, index: true },
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be at least 1.'],
      max: [5, 'Rating cannot exceed 5.'],
      index: true,
    },
    comment: { type: String, required: [true, 'Review comment is required.'], trim: true },
    verified: { type: Boolean, default: true, index: true },
    avatar: {
      type: String,
      default: '',
      validate: {
        validator: function (v: string) {
          if (!v) return true;
          return !v.startsWith('data:image/');
        },
        message: 'Base64 image strings are not allowed.',
      },
    },
    date: { type: String, required: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ isDeleted: 1, rating: -1 });

export const ReviewModel = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);


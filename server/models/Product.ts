import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  price: number;
  description: string;
  shape: string;
  length: string;
  size: string;
  images: string[];
  tag?: string;
  category: string;
  rating: number;
  ratingCount: number;
  featured?: boolean;
  hidden?: boolean;
  instagramLink?: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required.'],
      trim: true,
      minlength: [2, 'Product title must be at least 2 characters.'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required.'],
      min: [0, 'Product price cannot be negative.'],
      index: true,
    },
    description: { type: String, required: [true, 'Product description is required.'], trim: true },
    shape: { type: String, required: [true, 'Nail shape is required.'], trim: true },
    length: { type: String, required: [true, 'Nail length is required.'], trim: true },
    size: { type: String, required: [true, 'Nail sizing option is required.'], trim: true },
    images: [
      {
        type: String,
        validate: {
          validator: function (v: string) {
            if (!v) return true;
            return !v.startsWith('data:image/'); // Prevent base64 image storage in MongoDB
          },
          message: 'Base64 image strings are not allowed in database. Store Cloudinary URL instead.',
        },
      },
    ],
    tag: { type: String, default: '', trim: true },
    category: { type: String, default: 'Luxury Press-On', trim: true, index: true },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    ratingCount: { type: Number, default: 1, min: 0 },
    featured: { type: Boolean, default: false, index: true },
    hidden: { type: Boolean, default: false, index: true },
    instagramLink: { type: String, default: '', trim: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

// Indexes
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ isDeleted: 1, hidden: 1, category: 1 });
ProductSchema.index({ isDeleted: 1, featured: 1 });
ProductSchema.index({ title: 'text', description: 'text', tag: 'text', category: 'text' });

export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);


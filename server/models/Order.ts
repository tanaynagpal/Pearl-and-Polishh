import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  shape?: string;
  length?: string;
  size?: string;
  image?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'shipped' | 'cancelled';
  customSizes?: string;
  shippingAddress?: string;
  notes?: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required.'],
      unique: true,
      trim: true,
      index: true,
    },
    userId: { type: String, required: [true, 'User ID is required.'], index: true },
    userEmail: {
      type: String,
      required: [true, 'Customer email is required.'],
      lowercase: true,
      trim: true,
      index: true,
    },
    userName: { type: String, required: [true, 'Customer name is required.'], trim: true },
    userPhone: { type: String, required: [true, 'Customer phone is required.'], trim: true },
    items: [
      {
        productId: { type: String, required: true },
        title: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1, default: 1 },
        shape: { type: String, trim: true },
        length: { type: String, trim: true },
        size: { type: String, trim: true },
        image: {
          type: String,
          validate: {
            validator: function (v: string) {
              if (!v) return true;
              return !v.startsWith('data:image/');
            },
            message: 'Base64 image strings are not allowed in order items.',
          },
        },
      },
    ],
    total: { type: Number, required: [true, 'Order total is required.'], min: 0 },
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'shipped', 'cancelled'],
        message: 'Invalid order status value.',
      },
      default: 'pending',
      index: true,
    },
    customSizes: { type: String, default: '', trim: true },
    shippingAddress: { type: String, default: '', trim: true },
    notes: { type: String, default: '', trim: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

// Indexes
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ isDeleted: 1, userId: 1, createdAt: -1 });
OrderSchema.index({ isDeleted: 1, status: 1 });
OrderSchema.index({ orderNumber: 'text', userName: 'text', userEmail: 'text' });

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);


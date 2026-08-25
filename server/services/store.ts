import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { UserModel, IUser } from '../models/User';
import { ProductModel, IProduct } from '../models/Product';
import { OrderModel, IOrder } from '../models/Order';
import { AppointmentModel, IAppointment } from '../models/Appointment';
import { ReviewModel } from '../models/Review';
import { ContactMessageModel } from '../models/ContactMessage';
import { StudioSettingsModel } from '../models/StudioSettings';
import { isMongoConnected } from '../config/db';

const DATA_DIR = path.join(process.cwd(), 'data_store');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILE_PATH = path.join(DATA_DIR, 'db.json');

export interface MemoryStoreData {
  users: any[];
  products: any[];
  orders: any[];
  appointments: any[];
  reviews: any[];
  messages: any[];
  settings: any;
}

import { INITIAL_PRODUCTS } from '../../src/data/products';
const INITIAL_SETTINGS = {
  studioName: 'Pearl & Polishh',
  tagline: 'LUDHIANA LUXURY ATELIER & CUSTOM GEL PRESS-ON STUDIO',
  address: '44, Tej Enclave, Bhamian Road, Ludhiana, Punjab - 141015',
  phoneWhatsApp: '+91 98778 85144',
  instagram: '@pearl.and.polishh',
  email: 'maanvinagpal18@gmail.com',
  openingHoursWeekdays: '10:00 AM – 7:00 PM',
  openingHoursSaturday: '10:00 AM – 6:00 PM',
  openingHoursSunday: 'Bridal Appointments Only',
};

const INITIAL_ADMIN_EMAIL =
  (process.env.ADMIN_INITIAL_EMAIL || 'admin@pearlandpolish.com')
    .trim()
    .toLowerCase();

const INITIAL_ADMIN_PASSWORD =
  process.env.ADMIN_INITIAL_PASSWORD || 'AdminPassword123!';

const INITIAL_ADMIN = {
  id: 'admin-01',
  name: process.env.ADMIN_INITIAL_NAME || 'Studio Admin',
  email: INITIAL_ADMIN_EMAIL,
  passwordHash: bcrypt.hashSync(INITIAL_ADMIN_PASSWORD, 12),
  role: 'admin' as const,
  phone: process.env.ADMIN_INITIAL_PHONE || '',
  isVerified: true,
  failedLoginAttempts: 0,
  lockUntil: null,
  isDeleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
export class Store {
  private static readJSON(): MemoryStoreData {
    try {
      if (fs.existsSync(FILE_PATH)) {
        const raw = fs.readFileSync(FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading file store:', e);
    }
    return {
      users: [INITIAL_ADMIN],
      products: INITIAL_PRODUCTS,
      orders: [],
      appointments: [],
      reviews: [],
      messages: [],
      settings: INITIAL_SETTINGS,
    };
  }

  private static writeJSON(data: MemoryStoreData) {
    try {
      fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing file store:', e);
    }
  }

  /**
   * Seed database strictly in DEVELOPMENT environment. Never seeds in production.
   */
 public static async initSeed() {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const shouldResetAdmin =
      process.env.ADMIN_RESET_ON_START === 'true';

  // ============================================================
  // MONGODB STORE
  // ============================================================
  if (isMongoConnected()) {
    try {
      const adminEmail = INITIAL_ADMIN.email.toLowerCase();

      const adminExists = await UserModel.findOne({
        email: adminEmail,
        isDeleted: { $ne: true },
      }as any);

      if (!adminExists) {
        // Create initial admin
        await UserModel.create({
          name: INITIAL_ADMIN.name,
          email: adminEmail,
          passwordHash: INITIAL_ADMIN.passwordHash,
          role: 'admin',
          phone: INITIAL_ADMIN.phone,
          isVerified: true,
          failedLoginAttempts: 0,
          lockUntil: null,
        });

        console.log(`[ADMIN] Created admin account: ${adminEmail}`);
      } else {
        // Always make sure this configured account is an admin.
        const updateData: any = {
          role: 'admin',
          isVerified: true,
          failedLoginAttempts: 0,
          lockUntil: null,
          isDeleted: false,
        };

        // IMPORTANT:
        // Only reset the password when explicitly enabled.
        if (shouldResetAdmin) {
          updateData.passwordHash = INITIAL_ADMIN.passwordHash;
          console.log(`[ADMIN] Password reset for: ${adminEmail}`);
        }

        await (UserModel as any).updateOne(
          { _id: adminExists._id },
          { $set: updateData }
        );

        console.log(`[ADMIN] Admin account ready: ${adminEmail}`);
      }

      // ========================================================
      // SEED PRODUCTS ONLY IF DATABASE IS EMPTY
      // ========================================================
      const prodCount = await ProductModel.countDocuments({
        isDeleted: { $ne: true },
      });

      if (prodCount === 0) {
        await ProductModel.insertMany(
          INITIAL_PRODUCTS.map((p) => ({
            title: p.title,
            price: p.price,
            description: p.description,
            images: [p.image],
            shape: p.shapeOptions?.[0] ?? 'Medium Almond',
            length: p.lengthOptions?.[0] ?? 'Medium',
            size: 'Standard',
            category: p.category,
            rating: p.rating,
            ratingCount: p.reviewCount,
            featured: p.isBestseller ?? false,
            tag: p.tags?.join(', ') ?? '',
          })) as any[]
        );
      }

      // ========================================================
      // SEED SETTINGS
      // ========================================================
      const settingsCount = await StudioSettingsModel.countDocuments();

      if (settingsCount === 0) {
        await StudioSettingsModel.create(INITIAL_SETTINGS);
      }
    } catch (err) {
      console.error('[SEED ERROR]', err);
    }

    return;
  }

  // ============================================================
  // LOCAL JSON STORE
  // ============================================================
  if (isDevelopment) {
    const data = this.readJSON();

    const adminIndex = data.users.findIndex(
      (u) => u.email?.toLowerCase() === INITIAL_ADMIN.email.toLowerCase()
    );

    if (adminIndex === -1) {
      data.users.push(INITIAL_ADMIN);
      this.writeJSON(data);

      console.log(
        `[ADMIN] Created local admin account: ${INITIAL_ADMIN.email}`
      );
    } else {
      const existingAdmin = data.users[adminIndex];

      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      existingAdmin.failedLoginAttempts = 0;
      existingAdmin.lockUntil = null;
      existingAdmin.isDeleted = false;

      if (shouldResetAdmin) {
        existingAdmin.passwordHash = INITIAL_ADMIN.passwordHash;

        console.log(
          `[ADMIN] Local password reset for: ${INITIAL_ADMIN.email}`
        );
      }

      data.users[adminIndex] = existingAdmin;
      this.writeJSON(data);

      console.log(
        `[ADMIN] Local admin account ready: ${INITIAL_ADMIN.email}`
      );
    }
  }
}

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  public static async findUserByEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    if (isMongoConnected()) {
      return await (UserModel as any).findOne({
        email: cleanEmail,
        isDeleted: { $ne: true },
      }).exec();
    }
    const data = this.readJSON();
    return (
      data.users.find(
        (u) => u.email.toLowerCase() === cleanEmail && !u.isDeleted
      ) || null
    );
  }

  public static async findUserById(id: string) {
    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id) && !id.startsWith('usr-') && !id.startsWith('admin-')) {
        return null;
      }
      return await (UserModel as any).findOne({
        $or: [{ _id: id }, { id }],
        isDeleted: { $ne: true },
      }).exec();
    }
    const data = this.readJSON();
    return (
      data.users.find((u) => (u.id === id || u._id === id) && !u.isDeleted) ||
      null
    );
  }

  public static async createUser(userData: {
    name: string;
    email: string;
    passwordHash?: string;
    role?: 'client' | 'admin';
    phone?: string;
    googleId?: string;
    avatar?: string;
    isVerified?: boolean;
    emailVerificationTokenHash?: string;
    emailVerificationExpires?: Date;
  }) {
    const cleanEmail = userData.email.trim().toLowerCase();

    if (isMongoConnected()) {
      const existing = await (UserModel as any).findOne({ email: cleanEmail }).exec();
      if (existing) {
        if (existing.isDeleted) {
          // Restore user soft delete
          existing.isDeleted = false;
          existing.deletedAt = null;
          existing.name = userData.name;
          if (userData.passwordHash) existing.passwordHash = userData.passwordHash;
          existing.role = userData.role || 'client';
          existing.phone = userData.phone || existing.phone;
          existing.isVerified = userData.isVerified ?? existing.isVerified;
          return await existing.save();
        }
        throw new Error(`An account with email '${cleanEmail}' already exists.`);
      }

      return await (UserModel as any).create({
        name: userData.name.trim(),
        email: cleanEmail,
        passwordHash: userData.passwordHash,
        role: userData.role || 'client',
        phone: userData.phone || '',
        googleId: userData.googleId,
        avatar: userData.avatar || '',
        isVerified: userData.isVerified !== undefined ? userData.isVerified : false,
        emailVerificationTokenHash: userData.emailVerificationTokenHash,
        emailVerificationExpires: userData.emailVerificationExpires,
      });
    }

    const data = this.readJSON();
    const existing = data.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing && !existing.isDeleted) {
      throw new Error(`An account with email '${cleanEmail}' already exists.`);
    }

    const newUser = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      _id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: userData.name.trim(),
      email: cleanEmail,
      passwordHash: userData.passwordHash || '',
      role: userData.role || 'client',
      phone: userData.phone || '',
      googleId: userData.googleId || '',
      avatar: userData.avatar || '',
      isVerified: userData.isVerified !== undefined ? userData.isVerified : false,
      refreshTokens: [],
      failedLoginAttempts: 0,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    this.writeJSON(data);
    return newUser;
  }

  public static async updateUser(id: string, updateData: any) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { _id: id }
        : { id };
      return await (UserModel as any).findOneAndUpdate(
        query,
        { $set: { ...updateData, updatedAt: new Date() } },
        { new: true, runValidators: true }
      ).exec();
    }
    const data = this.readJSON();
    const idx = data.users.findIndex((u) => u.id === id || u._id === id);
    if (idx !== -1) {
      data.users[idx] = {
        ...data.users[idx],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      this.writeJSON(data);
      return data.users[idx];
    }
    return null;
  }

  public static async getAllUsers() {
    if (isMongoConnected()) {
      return await (UserModel as any).find({ isDeleted: { $ne: true } }, '-passwordHash')
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    }
    const data = this.readJSON();
    return data.users
      .filter((u) => !u.isDeleted)
      .map(({ passwordHash, ...u }) => u);
  }

  public static async deleteUser(id: string) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
      return await (UserModel as any).findOneAndUpdate(
        query,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
      ).exec();
    }
    const data = this.readJSON();
    const idx = data.users.findIndex((u) => u.id === id || u._id === id);
    if (idx !== -1) {
      data.users[idx].isDeleted = true;
      data.users[idx].deletedAt = new Date().toISOString();
      this.writeJSON(data);
      return true;
    }
    return false;
  }

  // ============================================================================
  // PRODUCT OPERATIONS
  // ============================================================================

  public static async getAllProducts(options?: {
    category?: string;
    search?: string;
    includeHidden?: boolean;
    featured?: boolean;
    page?: number;
    limit?: number;
  }) {
    if (isMongoConnected()) {
      const filter: any = { isDeleted: { $ne: true } };

      if (!options?.includeHidden) {
        filter.hidden = { $ne: true };
      }

      if (options?.category && options.category !== 'All') {
        filter.category = options.category;
      }

      if (options?.featured) {
        filter.featured = true;
      }

      if (options?.search) {
        filter.$text = { $search: options.search };
      }

      let query = (ProductModel as any).find(filter).sort({ createdAt: -1 });

      if (options?.page && options?.limit) {
        const skip = (options.page - 1) * options.limit;
        query = query.skip(skip).limit(options.limit);
      }

      const products = await query.lean().exec();

      return products.map((product: any) => ({
        ...product,
        id: product.id || product._id?.toString(),
      }));
    }

    const data = this.readJSON();
    let prods = data.products.filter((p) => !p.isDeleted);
    if (!options?.includeHidden) {
      prods = prods.filter((p) => !p.hidden);
    }
    if (options?.category && options.category !== 'All') {
      prods = prods.filter((p) => p.category === options.category);
    }
    if (options?.featured) {
      prods = prods.filter((p) => p.featured);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      prods = prods.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    return prods;
  }

  public static async createProduct(prod: any) {
    if (isMongoConnected()) {
      return await (ProductModel as any).create({
        ...prod,
        rating: prod.rating ?? 5.0,
        ratingCount: prod.ratingCount ?? 1,
        featured: prod.featured ?? false,
        hidden: prod.hidden ?? false,
        isNew: prod.isNew ?? false,
      });
    }
    const data = this.readJSON();
    const newProd = {
  id: 'pp-' + Date.now(),
  _id: 'pp-' + Date.now(),
  ...prod,
  featured: prod.featured ?? false,
  isNew: prod.isNew ?? false,
  hidden: prod.hidden ?? false,
  isDeleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
    data.products.push(newProd);
    this.writeJSON(data);
    return newProd;
  }

  public static async updateProduct(id: string, prod: any) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
      return await (ProductModel as any).findOneAndUpdate(
        query,
        { $set: { ...prod, updatedAt: new Date() } },
        { new: true, runValidators: true }
      ).exec();
    }
    const data = this.readJSON();
    const index = data.products.findIndex((p) => p.id === id || p._id === id);
    if (index !== -1) {
      data.products[index] = {
        ...data.products[index],
        ...prod,
        updatedAt: new Date().toISOString(),
      };
      this.writeJSON(data);
      return data.products[index];
    }
    return null;
  }

  public static async getProductById(id: string) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
      return await (ProductModel as any).findOne({ ...query, isDeleted: { $ne: true } }).lean().exec();
    }
    const data = this.readJSON();
    return data.products.find((p) => (p.id === id || p._id === id) && !p.isDeleted) || null;
  }

  public static async deleteProduct(id: string) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
      return await (ProductModel as any).findOneAndUpdate(
        query,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
      ).exec();
    }
    const data = this.readJSON();
    const index = data.products.findIndex((p) => p.id === id || p._id === id);
    if (index !== -1) {
      data.products[index].isDeleted = true;
      data.products[index].deletedAt = new Date().toISOString();
      this.writeJSON(data);
      return true;
    }
    return false;
  }

  // ============================================================================
  // ORDER OPERATIONS (WITH TRANSACTIONS WHERE SUPPORTED)
  // ============================================================================

  public static async createOrder(orderData: any) {
    const orderNumber =
      orderData.orderNumber ||
      `PP-ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isMongoConnected()) {
      // Use Transaction if MongoDB Cluster / Replica Set is enabled
      const session = await mongoose.startSession();
      try {
        let result: any = null;
        await session.withTransaction(async () => {
          // Check duplicate orderNumber
          const existing = await (OrderModel as any).findOne({ orderNumber }).session(session);
          if (existing) {
            throw new Error(`Order number ${orderNumber} already exists.`);
          }

          const created = await (OrderModel as any).create([
            {
              ...orderData,
              orderNumber,
              userEmail: orderData.userEmail.trim().toLowerCase(),
              status: orderData.status || 'pending',
            },
          ], { session });

          result = created[0];
        });
        session.endSession();
        return result;
      } catch (err: any) {
        session.endSession();
        // Fallback for Standalone MongoDB instances that don't support replica set transactions
        if (err.message && err.message.includes('Transaction numbers are only allowed')) {
          const existing = await (OrderModel as any).findOne({ orderNumber }).exec();
          if (existing) {
            throw new Error(`Order number ${orderNumber} already exists.`);
          }
          return await (OrderModel as any).create({
            ...orderData,
            orderNumber,
            userEmail: orderData.userEmail.trim().toLowerCase(),
            status: orderData.status || 'pending',
          });
        }
        throw err;
      }
    }

    const data = this.readJSON();
    const newOrder = {
      id: 'ord-' + Date.now(),
      _id: 'ord-' + Date.now(),
      ...orderData,
      orderNumber,
      userEmail: orderData.userEmail.trim().toLowerCase(),
      status: orderData.status || 'pending',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.orders.push(newOrder);
    this.writeJSON(data);
    return newOrder;
  }

  public static async getOrdersByUserId(userId: string) {
    if (isMongoConnected()) {
      return await (OrderModel as any).find({
        userId,
        isDeleted: { $ne: true },
      })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    }
    const data = this.readJSON();
    return data.orders
      .filter((o) => o.userId === userId && !o.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async getAllOrders(options?: { status?: string; search?: string }) {
    if (isMongoConnected()) {
      const filter: any = { isDeleted: { $ne: true } };

      if (options?.status && options.status !== 'all') {
        filter.status = options.status;
      }

      if (options?.search) {
        filter.$text = { $search: options.search };
      }

      return await (OrderModel as any).find(filter)
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    }

    const data = this.readJSON();
    let orders = data.orders.filter((o) => !o.isDeleted);
    if (options?.status && options.status !== 'all') {
      orders = orders.filter((o) => o.status === options.status);
    }
    if (options?.search) {
      const q = options.search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.userEmail?.toLowerCase().includes(q) ||
          o.userName?.toLowerCase().includes(q)
      );
    }
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async updateOrderStatus(id: string, status: string) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
      return await (OrderModel as any).findOneAndUpdate(
        query,
        { $set: { status, updatedAt: new Date() } },
        { new: true, runValidators: true }
      ).exec();
    }
    const data = this.readJSON();
    const index = data.orders.findIndex((o) => o.id === id || o._id === id);
    if (index !== -1) {
      data.orders[index].status = status;
      data.orders[index].updatedAt = new Date().toISOString();
      this.writeJSON(data);
      return data.orders[index];
    }
    return null;
  }

  public static async getOrderById(id: string) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
      return await (OrderModel as any).findOne({ ...query, isDeleted: { $ne: true } }).lean().exec();
    }
    const data = this.readJSON();
    return data.orders.find((o) => (o.id === id || o._id === id) && !o.isDeleted) || null;
  }

  public static async deleteOrder(id: string) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
      return await (OrderModel as any).findOneAndUpdate(
        query,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
      ).exec();
    }
    const data = this.readJSON();
    const index = data.orders.findIndex((o) => o.id === id || o._id === id);
    if (index !== -1) {
      data.orders[index].isDeleted = true;
      data.orders[index].deletedAt = new Date().toISOString();
      this.writeJSON(data);
      return true;
    }
    return false;
  }

  // ============================================================================
  // APPOINTMENT OPERATIONS (SLOT COLLISION PREVENTION & ATOMIC CREATION)
  // ============================================================================

  public static async createAppointment(aptData: any) {
    const appointmentNumber =
      aptData.appointmentNumber ||
      `PP-APT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isMongoConnected()) {
      // Slot collision check: Ensure no active appointment exists for date & timeSlot
      const collision = await (AppointmentModel as any).findOne({
        date: aptData.date.trim(),
        timeSlot: aptData.timeSlot.trim(),
        status: { $ne: 'rejected' },
        isDeleted: { $ne: true },
      }).exec();

      if (collision) {
        throw new Error(
          `The selected slot '${aptData.timeSlot}' on ${aptData.date} is already booked. Please choose another time slot.`
        );
      }

      return await (AppointmentModel as any).create({
        ...aptData,
        appointmentNumber,
        clientEmail: aptData.clientEmail.trim().toLowerCase(),
        status: aptData.status || 'pending',
      });
    }

    const data = this.readJSON();
    const collision = data.appointments.find(
      (a) =>
        a.date === aptData.date.trim() &&
        a.timeSlot === aptData.timeSlot.trim() &&
        a.status !== 'rejected' &&
        !a.isDeleted
    );

    if (collision) {
      throw new Error(
        `The selected slot '${aptData.timeSlot}' on ${aptData.date} is already booked. Please choose another time slot.`
      );
    }

    const newApt = {
      id: 'apt-' + Date.now(),
      _id: 'apt-' + Date.now(),
      ...aptData,
      appointmentNumber,
      clientEmail: aptData.clientEmail.trim().toLowerCase(),
      status: aptData.status || 'pending',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.appointments.push(newApt);
    this.writeJSON(data);
    return newApt;
  }

  public static async getAppointmentsByUserId(userId: string) {
    if (isMongoConnected()) {
      return await (AppointmentModel as any).find({
        userId,
        isDeleted: { $ne: true },
      })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    }
    const data = this.readJSON();
    return data.appointments
      .filter((a) => a.userId === userId && !a.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async getAllAppointments(options?: { status?: string; date?: string }) {
    if (isMongoConnected()) {
      const filter: any = { isDeleted: { $ne: true } };

      if (options?.status && options.status !== 'all') {
        filter.status = options.status;
      }

      if (options?.date) {
        filter.date = options.date;
      }

      return await (AppointmentModel as any).find(filter)
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    }

    const data = this.readJSON();
    let appointments = data.appointments.filter((a) => !a.isDeleted);
    if (options?.status && options.status !== 'all') {
      appointments = appointments.filter((a) => a.status === options.status);
    }
    if (options?.date) {
      appointments = appointments.filter((a) => a.date === options.date);
    }
    return appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static async updateAppointmentStatus(id: string, status: string) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
      return await (AppointmentModel as any).findOneAndUpdate(
        query,
        { $set: { status, updatedAt: new Date() } },
        { new: true, runValidators: true }
      ).exec();
    }
    const data = this.readJSON();
    const index = data.appointments.findIndex((a) => a.id === id || a._id === id);
    if (index !== -1) {
      data.appointments[index].status = status;
      data.appointments[index].updatedAt = new Date().toISOString();
      this.writeJSON(data);
      return data.appointments[index];
    }
    return null;
  }

  public static async getAppointmentById(id: string) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
      return await (AppointmentModel as any).findOne({ ...query, isDeleted: { $ne: true } }).lean().exec();
    }
    const data = this.readJSON();
    return data.appointments.find((a) => (a.id === id || a._id === id) && !a.isDeleted) || null;
  }

  public static async deleteAppointment(id: string) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { id };
      return await (AppointmentModel as any).findOneAndUpdate(
        query,
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { new: true }
      ).exec();
    }
    const data = this.readJSON();
    const index = data.appointments.findIndex((a) => a.id === id || a._id === id);
    if (index !== -1) {
      data.appointments[index].isDeleted = true;
      data.appointments[index].deletedAt = new Date().toISOString();
      this.writeJSON(data);
      return true;
    }
    return false;
  }

  // ============================================================================
  // CONTACT MESSAGES OPERATIONS
  // ============================================================================

  public static async createContactMessage(msg: any) {
    if (isMongoConnected()) {
      return await (ContactMessageModel as any).create({
        ...msg,
        email: msg.email.trim().toLowerCase(),
        status: 'unread',
      });
    }
    const data = this.readJSON();
    const newMsg = {
      id: 'msg-' + Date.now(),
      _id: 'msg-' + Date.now(),
      ...msg,
      email: msg.email.trim().toLowerCase(),
      status: 'unread',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    data.messages.push(newMsg);
    this.writeJSON(data);
    return newMsg;
  }

  public static async getAllContactMessages() {
    if (isMongoConnected()) {
      return await (ContactMessageModel as any).find({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .lean()
        .exec();
    }
    const data = this.readJSON();
    return data.messages
      .filter((m) => !m.isDeleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // ============================================================================
  // STUDIO SETTINGS OPERATIONS
  // ============================================================================

  public static async getSettings() {
    if (isMongoConnected()) {
      const settings = await (StudioSettingsModel as any).findOne().exec();
      return settings || INITIAL_SETTINGS;
    }
    const data = this.readJSON();
    return data.settings || INITIAL_SETTINGS;
  }

  public static async updateSettings(newSettings: any) {
    if (isMongoConnected()) {
      const updated = await (StudioSettingsModel as any).findOneAndUpdate({}, newSettings, {
        upsert: true,
        new: true,
        runValidators: true,
      }).exec();
      return updated;
    }
    const data = this.readJSON();
    data.settings = { ...data.settings, ...newSettings };
    this.writeJSON(data);
    return data.settings;
  }

}


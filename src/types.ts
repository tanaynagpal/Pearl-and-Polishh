export type ProductCategory = 'Gel Polish' | '3D Art' | 'Press-Ons' | 'Bridal' | 'Chrome' | 'Gel Extensions';

export type PressOnSize = 'XS' | 'S' | 'M' | 'L' | 'Custom';

export type PressOnShape = 'Short Almond' | 'Medium Almond' | 'Long Coffin' | 'Short Square' | 'Medium Coffin' | 'Stiletto' | 'Oval';

export type PressOnFinish = 'Glossy Topcoat' | 'Velvety Matte' | 'Glazed Chrome' | 'Cat-Eye Shimmer' | '3D Gel & Pearls';

export interface NailProduct {
  id: string;
  title: string;
  category: ProductCategory;
  price: number;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isNew?: boolean;
  lengthOptions: string[];
  shapeOptions: PressOnShape[];
  features: string[];
  tags: string[];
}

export interface CustomFingerSizes {
  leftThumb: number; // in mm
  leftIndex: number;
  leftMiddle: number;
  leftRing: number;
  leftPinky: number;
  rightThumb: number;
  rightIndex: number;
  rightMiddle: number;
  rightRing: number;
  rightPinky: number;
}

export interface CustomPressOnState {
  shape: PressOnShape;
  length: 'Short' | 'Medium' | 'Long' | 'Extra Long';
  sizePreset: PressOnSize;
  customSizes: CustomFingerSizes;
  baseColor: string;
  finish: PressOnFinish;
  artComplexity: 'Minimal / Sheer' | 'Moderate / Accent Nails' | 'Intricate / Full 3D Charms' | 'Bridal / Sculpted Pearls';
  notes: string;
  clientName: string;
}

export interface BookingState {
  serviceName: string;
  appointmentType: 'In-Studio Gel Service' | 'Press-On Fitting & Consultation' | 'Bridal Trial Package';
  date: string;
  timeSlot: string;
  clientName: string;
  phone: string;
  specialNotes: string;
}

export interface Testimonial {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  itemPurchased: string;
  verified: boolean;
  avatarUrl?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Press-Ons' | 'Sizing & Care' | 'Studio Appointments' | 'Shipping & WhatsApp Orders';
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  vipTier?: 'Velvet Bronze' | 'Rose Gold VIP' | 'Maroon Diamond';
  savedSizes?: CustomFingerSizes;
  favoriteProductIds?: string[];
  createdAt: string;
}

export type OrderStatus = 'Pending Inquiry' | 'Confirmed' | 'In Crafting' | 'Shipped' | 'Completed' | 'Cancelled';

export interface OrderRecord {
  id: string;
  userId?: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  itemTitle: string;
  productCategory: string;
  details: string; // size, shape, finish, custom notes
  price: number;
  status: OrderStatus;
  date: string;
}

export type AppointmentStatus = 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface AppointmentRecord {
  id: string;
  userId?: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  appointmentType: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  specialNotes?: string;
}

export interface StudioService {
  id: string;
  title: string;
  duration: string;
  category: 'In-Studio Gel Service' | 'Press-On Fitting & Consultation' | 'Bridal Trial Package' | string;
}

export interface StudioSettings {
  studioName: string;
  tagline: string;
  address: string;
  phoneWhatsApp: string;
  instagram: string;
  email: string;
  openingHoursWeekdays: string;
  openingHoursSaturday: string;
  openingHoursSunday: string;
  bannerAnnouncement: string;
  appointmentServices?: StudioService[];
  appointmentTimeSlots?: string[];
  heroCardBadge?: string;
  heroCardTitle?: string;
  heroCardSubtitle?: string;
  heroCardPrice?: string;
  heroCardDescription?: string;
  heroCardImageUrl?: string;
  heroCardReviewQuote?: string;
}


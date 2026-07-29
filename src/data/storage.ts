import { StudioSettings, StudioService, NailProduct, Testimonial, UserProfile } from '../types';
import { PRODUCTS } from './products';

export const DEFAULT_STUDIO_SERVICES: StudioService[] = [
  { id: 'svc-1', title: 'In-Studio Russian Manicure & Builder Gel (₹1,950)', duration: '90 min', category: 'In-Studio Gel Service' },
  { id: 'svc-2', title: 'Full Sculpted Gel Extensions & Custom Art (₹2,800)', duration: '120 min', category: 'In-Studio Gel Service' },
  { id: 'svc-3', title: 'Custom Press-On Fitting & Sizing Trial (₹850)', duration: '45 min', category: 'Press-On Fitting & Consultation' },
  { id: 'svc-4', title: 'VIP Bridal Nail Trial & Royal High-Tea Consultation (₹3,500)', duration: '120 min', category: 'Bridal Trial Package' },
];

export const DEFAULT_STUDIO_TIME_SLOTS: string[] = ['10:00 AM', '12:30 PM', '2:30 PM', '4:30 PM', '6:00 PM'];

export const INITIAL_STUDIO_SETTINGS: StudioSettings = {
  studioName: 'Pearl & Polishh',
  tagline: 'Ludhiana Studio & Custom Gel Press-On Boutique',
  address: '44, Tej Enclave, Bhamian Road, Ludhiana, Punjab - 141015',
  phoneWhatsApp: '+91 98778 85144',
  instagram: '@pearl.and.polishh',
  email: 'maanvinagpal18@gmail.com',
  openingHoursWeekdays: '10:00 AM – 7:00 PM',
  openingHoursSaturday: '10:00 AM – 6:00 PM',
  openingHoursSunday: 'Bridal Appointments Only',
  bannerAnnouncement: '✨ Complimentary Application Prep Kit & Velvet Pouch with every custom set ordered this week! ✨',
  appointmentServices: DEFAULT_STUDIO_SERVICES,
  appointmentTimeSlots: DEFAULT_STUDIO_TIME_SLOTS,
  heroCardBadge: 'Rose Pearls & Velvet Set',
  heroCardTitle: 'Custom Press-On Set & Kit',
  heroCardSubtitle: 'Ready to Order',
  heroCardPrice: '₹1,850',
  heroCardDescription: 'Includes 10 custom press-on nails in velvet finish, salon glue, sticky tabs, alcohol prep wipes & cuticle pusher.',
  heroCardImageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1200',
  heroCardReviewQuote: 'Gorgeous luxury shine!',
};

export const SAMPLE_REVIEWS: Testimonial[] = [
  {
    id: 't1',
    author: 'Simran Kaur',
    location: 'Ludhiana, Punjab',
    rating: 5,
    date: '3 days ago',
    comment: 'The 3D rose petals and freshwater pearls on my set were beyond stunning. They fit my nail beds perfectly without pop-offs!',
    itemPurchased: 'Maroon Velvet Rose & Freshwater Pearls',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 't2',
    author: 'Gurpreet Brar',
    location: 'Ludhiana, Punjab',
    rating: 5,
    date: '1 week ago',
    comment: 'Visited the studio at 44, Tej Enclave for a Russian gel manicure. Super neat cuticle work and luxurious ambiance.',
    itemPurchased: 'In-Studio Russian Gel Manicure',
    verified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  }
];

// Fallback getters for legacy static component calls
export function getStoredStudioSettings(): StudioSettings {
  return INITIAL_STUDIO_SETTINGS;
}

export function getStoredProducts(): NailProduct[] {
  return PRODUCTS;
}

export function getStoredTestimonials(): Testimonial[] {
  return SAMPLE_REVIEWS;
}

export function getStoredUser(): UserProfile | null {
  return null;
}

export function setStoredUser(user: UserProfile | null): void {
  // Session managed via backend HTTP-only cookies
}

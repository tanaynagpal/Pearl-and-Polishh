import { NailProduct, FAQItem } from '../types';

export const WHATSAPP_PHONE = '+91 98778 85144'; // Brand WhatsApp contact number
export const STUDIO_INSTAGRAM = '@pearl.and.polishh';
export const STUDIO_INSTAGRAM_URL = 'https://www.instagram.com/pearl.and.polishh?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==';
export const STUDIO_ADDRESS = '44, Tej Enclave, Bhamian Road, Ludhiana, Punjab - 141015';

/**
 * Formats a dynamic WhatsApp click-to-chat URL with properly encoded pre-filled text
 */
export function buildWhatsAppUrl(message: string, phone: string = WHATSAPP_PHONE): string {
  // Replace huge base64 data URIs with a clean text placeholder so URL parameters don't break
  let cleanMessage = message;
  if (cleanMessage.includes('data:image')) {
    cleanMessage = cleanMessage.replace(/data:image\/[a-zA-Z0-9+.\-]+;base64,[a-zA-Z0-9+/=]+/g, '[Uploaded Photo Attached in App/Gallery]');
  }

  // Safety check for URL length limit (~1800 characters)
  if (cleanMessage.length > 1800) {
    cleanMessage = cleanMessage.substring(0, 1800) + '... [Message truncated]';
  }

  const encodedText = encodeURIComponent(cleanMessage.trim());
  return `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodedText}`;
}

export const PRODUCTS: NailProduct[] = [
  {
    id: 'pp-01',
    title: 'Maroon Velvet Rose & Freshwater Pearls',
    category: '3D Art',
    price: 1850,
    description: 'Handcrafted luxury press-on set in deep royal maroon velvet finish with hand-sculpted 3D rose petals, miniature freshwater pearls, and 24k gold leaf filigree accents.',
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1000',
    rating: 5.0,
    reviewCount: 48,
    isBestseller: true,
    lengthOptions: ['Short', 'Medium', 'Long'],
    shapeOptions: ['Short Almond', 'Medium Almond', 'Long Coffin', 'Stiletto'],
    features: ['100% Salon Gel Polished', 'Deep Royal Maroon Velvet', 'Reusable up to 5x', 'Includes Prep Kit & Glue'],
    tags: ['Maroon', 'Velvet', '3D Rose', 'Pearls', 'Gold Leaf']
  },
  {
    id: 'pp-02',
    title: 'Vibrant Magenta Chrome & Glazed Aurora',
    category: 'Chrome',
    price: 1450,
    description: 'Electric vibrant magenta glazed chrome over a crisp micro-French outline. Shifts brilliantly from rich magenta to gold under light.',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=1000',
    rating: 4.9,
    reviewCount: 41,
    isBestseller: true,
    lengthOptions: ['Short', 'Medium'],
    shapeOptions: ['Short Almond', 'Medium Almond', 'Short Square'],
    features: ['Vibrant Magenta Glaze', 'Iridescent Chrome', 'Scratch Resistant', 'Lightweight Feel'],
    tags: ['Magenta', 'Vibrant Pink', 'Chrome', 'Glazed', 'French']
  },
  {
    id: 'pp-03',
    title: 'Deep Ruby Wine Cat-Eye Shimmer',
    category: 'Chrome',
    price: 1350,
    description: 'Magnetically aligned rich wine ruby cat-eye shimmer that creates a velvety dimensional illusion with gold micro-sparkles.',
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=1000',
    rating: 4.9,
    reviewCount: 35,
    isNew: true,
    lengthOptions: ['Medium', 'Long', 'Stiletto'],
    shapeOptions: ['Medium Almond', 'Long Coffin', 'Stiletto'],
    features: ['Magnetic Ruby Velvet', 'Glass High-Gloss Seal', 'Ultra Reinforced Base', 'Statement Glam'],
    tags: ['Ruby', 'Maroon', 'Cat-Eye', 'Wine', 'Velvet']
  },
  {
    id: 'pp-04',
    title: 'Bridal Royal Crimson & Gold Zari Art',
    category: 'Bridal',
    price: 2450,
    description: 'Opulent wedding press-on set crafted for royal bridal lehengas. Features deep crimson maroon gel base, hand-drawn gold zari line motifs, and sculpted pearl drops.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1000',
    rating: 5.0,
    reviewCount: 62,
    isBestseller: true,
    lengthOptions: ['Short', 'Medium', 'Long'],
    shapeOptions: ['Short Almond', 'Medium Almond', 'Oval', 'Long Coffin'],
    features: ['Hand-Painted Gold Zari', 'Custom Sizing Included', 'Includes Prep Kit & Adhesive Tabs', 'Luxurious Velvet Gift Box'],
    tags: ['Bridal', 'Crimson', 'Gold Zari', 'Wedding']
  },
  {
    id: 'pp-05',
    title: 'In-Studio Russian Manicure & Maroon Overlay',
    category: 'Gel Polish',
    price: 1950,
    description: 'Dry hardware Russian cuticle care followed by custom structured builder gel overlay in rich deep maroon or custom shade for 4+ weeks of flawless wear.',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1000',
    rating: 5.0,
    reviewCount: 92,
    isBestseller: true,
    lengthOptions: ['Natural Length'],
    shapeOptions: ['Short Almond', 'Short Square', 'Oval'],
    features: ['Precision Cuticle Care', 'Apex Architecture Builder Gel', 'Non-Toxic Premium Gel', '4+ Week Longevity'],
    tags: ['Studio Service', 'Builder Gel', 'Russian Mani', 'Ludhiana Studio']
  },
  {
    id: 'pp-06',
    title: 'Rose Gold Metallic & Quartz Crystal',
    category: '3D Art',
    price: 1650,
    description: 'Blush pink marble aura base with hand-poured liquid rose gold chrome waves and clear 3D quartz crystal clusters.',
    image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=1000',
    rating: 4.8,
    reviewCount: 28,
    isNew: true,
    lengthOptions: ['Short', 'Medium', 'Long'],
    shapeOptions: ['Short Almond', 'Medium Almond', 'Long Coffin'],
    features: ['Liquid Rose Gold Wave', 'Quartz Crystal Clusters', 'Reusable Base', 'Custom Fit Available'],
    tags: ['Rose Gold', '3D Quartz', 'Vibrant Pink', 'Marble']
  },
  {
    id: 'pp-07',
    title: 'Minimalist Hot Pink Ombre Aura',
    category: 'Press-Ons',
    price: 1150,
    description: 'Understated yet vibrant. Sheer blush nude base fading softly into a hot pink aura center with micro gold stars.',
    image: 'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&q=80&w=1000',
    rating: 4.9,
    reviewCount: 31,
    lengthOptions: ['Short', 'Medium'],
    shapeOptions: ['Short Almond', 'Short Square', 'Medium Almond'],
    features: ['Aura Airbrush Effect', 'Micro Gold Stars', 'Daily Wear Ready', 'Subtle & Sophisticated'],
    tags: ['Hot Pink', 'Aura', 'Gold Stars', 'Trendy']
  },
  {
    id: 'pp-08',
    title: 'Custom VIP Bridal Party Package (5 Sets)',
    category: 'Bridal',
    price: 7500,
    description: 'Custom tailored press-on sets in maroon, magenta, or champagne gold for the Bride and 4 Bridesmaids. Includes virtual or in-studio sizing consultation.',
    image: 'https://images.unsplash.com/photo-1522337094846-8a83811129f2?auto=format&fit=crop&q=80&w=1000',
    rating: 5.0,
    reviewCount: 19,
    isBestseller: true,
    lengthOptions: ['Custom Per Hand'],
    shapeOptions: ['Short Almond', 'Medium Almond', 'Long Coffin', 'Oval'],
    features: ['5 Full Custom Sets', 'Individual Sizing Kits', 'Custom Monogrammed Boxes', 'Dedicated WhatsApp Concierge'],
    tags: ['Bridal Party', 'Wedding Set', 'Custom VIP', 'Maroon & Gold']
  },
  {
    id: 'pp-09',
    title: 'Full Sculpted Gel Extensions & Custom Art',
    category: 'Gel Extensions',
    price: 2800,
    description: 'In-studio full sculpted gel extensions using high-durability builder gel with hand-painted artwork and glass finish.',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=1000',
    rating: 5.0,
    reviewCount: 24,
    isNew: true,
    lengthOptions: ['Medium', 'Long', 'Extra Long'],
    shapeOptions: ['Long Coffin', 'Medium Almond', 'Stiletto', 'Short Square'],
    features: ['Sculpted Apex Architecture', 'Custom Hand Art', 'In-Studio Service', '4+ Weeks Longevity'],
    tags: ['Gel Extensions', 'In-Studio', 'Sculpted', 'Custom Art']
  }
];

export const INITIAL_PRODUCTS = PRODUCTS;

export const FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Press-Ons',
    question: 'How long do Pearl & Polishh custom press-on nails last?',
    answer: 'With proper nail prep (using our included buffer, alcohol wipe, and cuticle pusher), our press-on sets last 2 to 3 weeks with nail glue, or 3 to 7 days when applied with our adhesive sticky tabs. Best of all, because they are crafted with multi-layer salon gel, they are 100% reusable up to 5 times!'
  },
  {
    id: 'faq-2',
    category: 'Sizing & Care',
    question: 'How do I know my nail size (XS, S, M, L) or measure my fingers?',
    answer: 'You can use our interactive Sizing & Prep Guide right here on the website! Simply hold a piece of clear tape across the widest part of your nail bed, mark the edges with a pen, measure the distance in millimeters with a ruler, and match with our chart. You can also save your measurements in your User Panel!'
  },
  {
    id: 'faq-3',
    category: 'Shipping & WhatsApp Orders',
    question: 'How do I place an order or customize my design on WhatsApp?',
    answer: 'Clicking any "Order via WhatsApp" button on our site will automatically launch a WhatsApp chat pre-filled with your chosen product details, size, shape, and custom notes. Our lead nail artist will review your request, confirm sizing, and send UPI/GPay/PhonePe payment details directly. We deliver Pan-India via DTDC/BlueDart express courier.'
  },
  {
    id: 'faq-4',
    category: 'Studio Appointments',
    question: 'Where is the Pearl & Polishh studio located and do I need an appointment?',
    answer: 'Our private nail studio is located at 44, Tej Enclave, Bhamian Road, Ludhiana, Punjab - 141015. All studio services (Russian Manicures, Gel Extensions, Bridal Consultations) are by appointment only to ensure an intimate 1-on-1 experience.'
  },
  {
    id: 'faq-5',
    category: 'Sizing & Care',
    question: 'Are press-on nails safe for my natural nails?',
    answer: 'Yes! Unlike traditional acrylic removals, removing our press-on nails requires soaking your fingers in warm water with olive oil and soap for 10-15 minutes. This gently dissolves the bond without scraping or damaging your natural nail bed.'
  }
];


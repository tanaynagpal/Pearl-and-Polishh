import React, { useState, useEffect } from 'react';
import { MessageCircle, Sparkles, ArrowRight, ShieldCheck, Star, Clock, CheckCircle2, Ruler } from 'lucide-react';
import { buildWhatsAppUrl } from '../data/products';
import { getStoredStudioSettings } from '../data/storage';
import { StudioSettings } from '../types';

interface HeroSectionProps {
  onOpenCustomBuilder: () => void;
  onOpenSizingGuide: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCustomBuilder,
  onOpenSizingGuide,
}) => {
  const [settings, setSettings] = useState<StudioSettings>(getStoredStudioSettings());

  useEffect(() => {
    setSettings(getStoredStudioSettings());
  }, []);

  const directWhatsAppUrl = buildWhatsAppUrl(
    `Hello ${settings.studioName}! I would like to order a custom press-on set. Could you assist me with sizing and design ideas?`,
    settings.phoneWhatsApp
  );

  return (
    <section className="relative pt-36 sm:pt-40 lg:pt-44 pb-20 md:pb-28 overflow-hidden bg-gradient-to-b from-[#FFF3F6] via-[#FCE4EC]/50 to-[#FFF3F6]">
      {/* Delicate background decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-[#E91E63]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#600A20]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Brand Headline & Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF3F6] border border-[#E91E63]/30 text-xs font-bold text-[#E91E63] uppercase tracking-widest shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E91E63]" />
              <span>Elegant & Timeless Nail Studio</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#420614] leading-[1.12] text-center lg:text-left">
              For the hands that{' '}
              <span className="italic font-normal text-[#E91E63]">Do the Talking</span> 
            </h1>

            <p className="text-base sm:text-lg text-[#600A20]/80 font-normal leading-relaxed max-w-2xl text-center lg:text-left">
              Custom-fit press-ons with glazed chrome, 3D details, pearls, and designs that actually turn heads. Wear them your way—shipped across India or fitted in our Ludhiana studio.
            </p>

            {/* Value Highlights */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 pb-2 w-full">
              <div className="flex items-center gap-2 text-xs font-bold text-[#420614]">
                <CheckCircle2 className="w-4 h-4 text-[#E91E63] shrink-0" />
                <span>100% Hand-Sculpted Gel</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#420614]">
                <CheckCircle2 className="w-4 h-4 text-[#E91E63] shrink-0" />
                <span>Reusable Up To 5x</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#420614]">
                <CheckCircle2 className="w-4 h-4 text-[#E91E63] shrink-0" />
                <span>Direct WhatsApp Order</span>
              </div>
            </div>

            {/* Primary Action Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-4 pt-4 w-full">
              <button
                onClick={onOpenCustomBuilder}
                className="px-7 py-4 rounded-full bg-vibrant-maroon text-white font-bold text-xs tracking-widest uppercase hover:bg-[#800E2B] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 cursor-pointer group border border-[#D4AF37]/30"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Create Custom Press-On Set</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 rounded-full border border-[#E91E63]/40 bg-white/90 backdrop-blur-xs text-[#420614] font-bold text-xs tracking-widest uppercase hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all flex items-center justify-center gap-2.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-white" />
                <span>Order via WhatsApp</span>
              </a>
            </div>

            {/* Quick Sizing Guide Link */}
            <div className="pt-2 flex justify-center lg:justify-start w-full">
              <button
                onClick={onOpenSizingGuide}
                className="text-xs font-bold text-[#E91E63] hover:underline flex items-center gap-1.5 cursor-pointer text-center"
              >
                <Ruler className="w-3.5 h-3.5 shrink-0" />
                <span>Unsure of your nail size? View our step-by-step measurement guide &rarr;</span>
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-6 border-t border-[#800E2B]/15 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-[#600A20] w-full">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#E91E63] text-[#E91E63]" />
                ))}
                <span className="font-bold text-[#420614] ml-1.5">4.9/5.0</span>
              </div>
              <div className="w-px h-4 bg-[#800E2B]/20" />
              <div>
                <span className="font-bold text-[#420614]">2,500+</span> Bespoke Sets Crafted
              </div>
              <div className="w-px h-4 bg-[#800E2B]/20 hidden sm:block" />
              <div className="hidden sm:block">
                <span className="font-bold text-[#420614]">2-3 Weeks</span> Wear Time
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative gold frame */}
              <div className="absolute -inset-3 rounded-2xl border border-[#E91E63]/30 transform rotate-1 pointer-events-none" />
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#800E2B]/20 bg-white">
                <img
                  src={settings.heroCardImageUrl || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=1200'}
                  alt={settings.heroCardTitle || 'Pearl & Polish Luxury Handcrafted Nails'}
                  className="w-full h-[460px] object-cover hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />

                {/* Floating Overlay Badge: Bestseller */}
                <div className="absolute top-4 left-4 bg-vibrant-maroon/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-[#D4AF37]/50 flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{settings.heroCardBadge || 'Rose Pearls & Velvet Set'}</span>
                </div>

                {/* Bottom Card Summary Panel */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#420614] via-[#420614]/85 to-transparent p-6 text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-extrabold">
                        {settings.heroCardSubtitle || 'Ready to Order'}
                      </p>
                      <h3 className="font-serif text-xl font-bold">{settings.heroCardTitle || 'Custom Press-On Set & Kit'}</h3>
                    </div>
                    <span className="font-serif text-2xl font-bold text-[#D4AF37]">{settings.heroCardPrice || '₹1,850'}</span>
                  </div>
                  
                  <p className="text-xs text-white/80 line-clamp-2">
                    {settings.heroCardDescription || 'Includes 10 custom press-on nails in velvet finish, salon glue, sticky tabs, alcohol prep wipes & cuticle pusher.'}
                  </p>

                  <div className="flex justify-end pt-1">
                    <a
                      href={buildWhatsAppUrl(
                        `Hello ${settings.studioName}! 💅\n\nI want to order the "${settings.heroCardBadge || 'Custom Set'}" (${settings.heroCardPrice || '₹1,850'}).\n\nPlease let me know availability and delivery details!`,
                        settings.phoneWhatsApp
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-full bg-[#420614] hover:bg-[#600A20] text-white text-xs font-bold tracking-wide border border-[#D4AF37]/60 transition-all flex items-center gap-2 shadow-md group/btn shrink-0"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366] group-hover/btn:scale-110 transition-transform shrink-0" />
                      <span>Order Now</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Small Floating Customer Proof Badge */}
              <div className="absolute -bottom-5 -left-5 bg-white p-3.5 rounded-xl shadow-xl border border-[#800E2B]/20 flex items-center gap-3 max-w-[220px]">
                <div className="w-10 h-10 rounded-full bg-[#FFF3F6] border border-[#E91E63] flex items-center justify-center font-bold text-xs text-[#E91E63] shrink-0">
                  5.0★
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#420614] leading-tight">
                    "{settings.heroCardReviewQuote || 'Gorgeous luxury shine!'}"
                  </p>
                  <p className="text-[10px] text-[#600A20]/70">Verified Client Review</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
